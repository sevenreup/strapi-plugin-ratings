import { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../pluginId';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  DEFAULT_PAGE_SIZE: 10,
  /**
   * Retrieve the strapi data storage for the plugin
   */
  getStore() {
    return strapi.store({
      type: 'plugin',
      name: PLUGIN_ID,
    });
  },
  async getPageSize() {
    const pluginStore = this.getStore();
    const pageSize = await pluginStore.get({ key: 'pageSize' });
    if (!pageSize) {
      return this.DEFAULT_PAGE_SIZE;
    }
    return pageSize;
  },
  setPageSize: async function (newPageSize) {
    const pluginStore = this.getStore();
    pluginStore.set({ key: 'pageSize', value: newPageSize });
  },
  async userCanPostReview(user, slug) {
    return true;
  },
});
