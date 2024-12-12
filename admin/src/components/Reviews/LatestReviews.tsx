import { useState, useEffect } from 'react';
import { Box } from '@strapi/design-system';
import { Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import ReviewsContainer from './ReviewsContainer';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@strapi/design-system';
import ErrorView from '../ui/error';

const LatestReviews = () => {
  const { get } = useFetchClient();
  const [reviewsData, setReviewsData] = useState<any | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const url = '/ratings';
      const { data } = await get(url);
      return data;
    },
  });
  const deleteReview = (id: any) => {
    setReviewsData({
      ...reviewsData,
      reviewsCount: reviewsData.reviewsCount - 1,
      reviews: reviewsData.reviews.filter((c: any) => c.id !== id),
    });
  };
  const addReviews = (reviews: any) => {
    setReviewsData({
      ...reviewsData,
      reviews: reviewsData.reviews.concat(reviews),
    });
  };

  useEffect(() => {
    console.log(data);

    if (data) {
      setReviewsData(data);
    }
  }, [data]);

  return (
    <Box background="neutral0" padding={4}>
      {isLoading && (
        <Box display="flex" height="100%">
          <Typography variant="beta">Loading latest comments...</Typography>
          <Loader />
        </Box>
      )}
      {reviewsData && (
        <ReviewsContainer data={reviewsData} actionAdd={addReviews} actionDelete={deleteReview} />
      )}
      <ErrorView error={error} />
    </Box>
  );
};

export default LatestReviews;
