/*
 *
 * HomePage
 *
 */

import { memo } from 'react';
// import PropTypes from 'prop-types';
import { Box, Typography } from '@strapi/design-system';
import { LatestReviews, ReviewsByKey } from '../components/Reviews';
import { Tab, TabContent, TabList, Tabs } from '../components/ui/tabs';

const HomePage = () => {
  return (
    <Box background="neutral100" padding={8}>
      <Box paddingBottom={3} paddingTop={3}>
        <Typography variant="alpha" fontWeight="bold">
          Content Ratings
        </Typography>
      </Box>
      <Tabs defaultValue="base">
        <TabList>
          <Tab value="base">Latest reviews</Tab>
          <Tab value="id">Reviews by content ID</Tab>
        </TabList>
        <TabContent value="base">
          <LatestReviews />
        </TabContent>
        <TabContent value="id">
          <ReviewsByKey />
        </TabContent>
      </Tabs>
    </Box>
  );
};

export default memo(HomePage);
