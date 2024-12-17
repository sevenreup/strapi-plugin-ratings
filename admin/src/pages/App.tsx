/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import { Route, Routes } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import HomePage from './HomePage';
import { Page } from '@strapi/strapi/admin';
import '@smastrom/react-rating/style.css'
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="*" element={<Page.Error />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
};

export default App;
