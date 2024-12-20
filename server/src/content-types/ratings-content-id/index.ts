export default {
  kind: 'collectionType',
  collectionName: 'r-content-id',
  info: {
    singularName: 'r-content-id',
    pluralName: 'r-content-ids',
    displayName: 'RContentID',
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
    reviews: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::ratings.review',
      mappedBy: 'related_to',
      configurable: false,
    },
    average: {
      type: 'decimal',
      configurable: false,
    },
    slug: {
      type: 'string',
      configurable: false,
    },
  },
};
