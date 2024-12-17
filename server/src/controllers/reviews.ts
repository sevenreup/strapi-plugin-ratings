import { Core } from '@strapi/strapi';
import { sanitize } from '@strapi/utils';

/**
 *   controller
 */

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx) {
    const { slug } = ctx.params;
    const { user } = ctx.state;
    const { start, ignoreCount } = ctx.request.query;
    const pageSize = await strapi.service('plugin::ratings.review').getPageSize();
    let reviews = await strapi.entityService.findMany('plugin::ratings.review', {
      filters: { related_to: { slug } },
      limit: pageSize,
      start,
      sort: { createdAt: 'desc' },
      populate: {
        author: { fields: ['id', 'username', 'email'] },
      },
    });
    let reviewsCount;
    let averageScore = 0;
    let userReview = null;
    if (!ignoreCount) {
      reviewsCount = await strapi.db.query('plugin::ratings.review').count({
        where: {
          related_to: { slug },
        },
      });
      const score = await strapi.db.query('plugin::ratings.r-content-id').findOne({
        select: ['average'],
        where: { slug },
      });
      if (score) {
        averageScore = score.average;
      }
    }
    // Check whether the user has already posted a review
    if (user) {
      userReview = await strapi.db.query('plugin::ratings.review').findOne({
        select: ['id', 'createdAt', 'comment', 'score'],
        where: {
          related_to: { slug },
          author: user.id,
        },
        populate: {
          author: { fields: ['id', 'username', 'email'] },
        },
      });
      if (userReview) {
        // Exclude user review
        reviews = reviews.filter((r) => r.id !== userReview.id);
      }
    }
    ctx.body = {
      reviewsCount,
      averageScore,
      userReview,
      reviews,
    };
  },

  async create(ctx) {
    const { user } = ctx.state;
    if (!user) {
      return ctx.badRequest('The user should be authenticated');
    }
    const { slug } = ctx.params;

    const userCanPostReview = await strapi
      .service('plugin::ratings.review')
      .userCanPostReview(user, slug);

    if (!userCanPostReview) {
      return ctx.forbidden('User cannot post a review on this content');
    }

    const { comment, score } = ctx.request.body;
    if (!score) {
      return ctx.badRequest('Score should be between 1-5', { slug, comment, score });
    }
    // Only one review per user is allowed.
    // Check if the user has already posted a review.
    const review = await strapi.db.query('plugin::ratings.review').findOne({
      select: ['id'],
      where: {
        related_to: { slug },
        author: user.id,
      },
    });
    if (review) {
      return ctx.badRequest('User already posted a review. Review ID:', review.id);
    }
    // Get data of related content with the given slug
    // If not exists, this is the fist review
    // - create the contentID and grab the ID
    let relatedContent = await strapi.db.query('plugin::ratings.r-content-id').findOne({
      select: ['id', 'average'],
      populate: {
        reviews: { fields: ['id'] },
      },
      where: { slug },
    });
    if (!relatedContent) {
      // First review ever for this content
      relatedContent = await strapi.entityService.create('plugin::ratings.r-content-id', {
        data: { slug, average: 0 },
        populate: {
          reviews: { fields: ['id'] },
        },
      });
    }
    // Create review and associate it with id.
    const newReview = await strapi.documents('plugin::ratings.review').create({
      data: {
        author: user.id,
        comment,
        score,
        related_to: relatedContent.id,
      },
    });
    // Update average rating
    const oldTotalScore = relatedContent.average * relatedContent.reviews.length;
    const newAvg = (oldTotalScore + score) / (relatedContent.reviews.length + 1);
    await strapi.documents('plugin::ratings.r-content-id').update({
      documentId: relatedContent.id,
      data: {
        average: newAvg,
      },
    });
    ctx.body = { id: newReview.id };
  },

  async getPageSize() {
    const pageSize = await strapi.service('plugin::ratings.review').getPageSize();
    return { pageSize };
  },

  async count(ctx) {
    const { slug } = ctx.params;
    // count reviews related to this content
    const reviewsCount = await strapi.db.query('plugin::ratings.review').count({
      where: {
        related_to: { slug },
      },
    });
    return {
      count: reviewsCount,
    };
  },

  async getStats(ctx) {
    const { slug } = ctx.params;
    const reviewsCount = await strapi.db.query('plugin::ratings.review').count({
      where: {
        related_to: { slug },
      },
    });
    let averageScore = 0;
    const score = await strapi.db.query('plugin::ratings.r-content-id').findOne({
      select: ['average'],
      where: { slug },
    });
    if (score) {
      averageScore = score.average;
    }
    ctx.body = {
      averageScore,
      reviewsCount,
    };
  },

  async getUserReview(ctx) {
    const { slug } = ctx.params;
    const { user, auth } = ctx.state;
    if (!user) {
      return ctx.badRequest('User unauthenticated');
    }
    const review = await strapi.db.query('plugin::ratings.review').findOne({
      select: ['id', 'createdAt', 'comment', 'score'],
      where: {
        related_to: { slug },
        author: user.id,
      },
      populate: {
        author: { select: ['id', 'username', 'email'] },
      },
    });
    ctx.body = {
      review: await sanitize
        .createAPISanitizers({
          getModel: strapi.getModel,
        })
        .output(review, strapi.getModel('plugin::ratings.review')),
    };
  },
});

export default controller;
