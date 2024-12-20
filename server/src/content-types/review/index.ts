export default {
  kind: 'collectionType',
  collectionName: 'review',
  info: {
    singularName: 'review',
    pluralName: 'reviews',
    displayName: 'Review',
    description: '',
  },
  options: {
    draftAndPublish: false,
    comment: '',
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    score: {
      type: 'integer',
    },
    author: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'plugin::users-permissions.user',
    },
    comment: {
      type: 'text',
    },
    related_to: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::ratings.r-content-id',
      inversedBy: 'reviews',
    },
  },
};
