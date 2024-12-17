import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Box,
  Typography,
  Flex,
} from '@strapi/design-system';
import { ModalLayout, ModalHeader, ModalBody, ModalFooter, ModalClose } from '../ui/modal';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { Review } from './Review';
import { Rating } from '@smastrom/react-rating';
const ROW_COUNT = 6;
const COL_COUNT = 10;

const ReviewsByKey = () => {
  const { get } = useFetchClient();
  const [reviewsData, setReviewsData] = useState<any | null>(null);
  const [reviewsJSX, setReviewsJSX] = useState<any | null>(null);
  const [currentContentID, setCurrentContentID] = useState(null);
  useEffect(() => {
    const fetchReviews = async () => {
      const url = '/ratings/reviews';
      try {
        const { data } = await get(url);
        setReviewsData(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReviews();
  }, []);

  const TableRow = styled(Tr)`
    &:hover {
      cursor: pointer;
      background: #d3d3d3;
    }
  `;
  useEffect(() => {
    if (reviewsData) {
      const reviews = reviewsData.map((data: any) => {
        const { contentID, reviews, averageScore } = data;
        return (
          <TableRow key={contentID} onClick={() => setCurrentContentID(contentID)}>
            <Td>{contentID}</Td>
            <Td>{reviews}</Td>
            <Td>
              <Rating
                readOnly={false}
                // isHalf={true}
                value={averageScore}
                // isArrowSubmit={false}
              />
            </Td>
          </TableRow>
        );
      });
      setReviewsJSX(reviews);
    }
  }, [reviewsData]);

  const ReviewsTable = ({ children }: { children: any }) => (
    <Table colCount={COL_COUNT} rowCount={ROW_COUNT}>
      <Thead>
        <Tr>
          <Th>
            <Typography fontWeight="bold">Content ID</Typography>
          </Th>
          <Th>
            <Typography fontWeight="bold">Reviews</Typography>
          </Th>
          <Th>
            <Typography fontWeight="bold">Average score</Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>{children}</Tbody>
    </Table>
  );

  return (
    <Box background="neutral0" padding={4}>
      {reviewsJSX ? (
        reviewsJSX.length > 0 ? (
          <>
            <ReviewsTable>{reviewsJSX}</ReviewsTable>
            <ListReviewsModal
              contentID={currentContentID}
              open={currentContentID !== null}
              onOpenChange={(open) => setCurrentContentID(open ? currentContentID : null)}
            />
          </>
        ) : (
          <Typography variant="beta">There are no reviews yet</Typography>
        )
      ) : (
        <Typography variant="beta">Loading reviews...</Typography>
      )}
    </Box>
  );
};

export default ReviewsByKey;

const ListReviewsModal = ({
  contentID,
  open,
  onOpenChange,
}: {
  contentID: any;
  open?: boolean;
  onOpenChange?(open: boolean): void;
}) => {
  const { get } = useFetchClient();
  const [reviewsData, setReviewsData] = useState<any | null>(null);
  const [reviewsJSX, setReviewsJSX] = useState<any | null>(null);
  const deleteReview = (id: any) => {
    setReviewsData({
      reviewsCount: reviewsData.reviewsCount - 1,
      reviews: reviewsData.reviews.filter((c: any) => c.id !== id),
    });
  };
  useEffect(() => {
    const fetchReviews = async () => {
      const url = `/ratings/reviews/${contentID}`;
      try {
        const { data } = await get(url);
        setReviewsData(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchReviews();
  }, [contentID]);
  useEffect(() => {
    if (reviewsData) {
      const totalReviews = reviewsData.reviews.map((review: any) => {
        return (
          <Review
            data={review}
            showDeleteButton={true}
            actionDelete={deleteReview}
            key={review.id}
          />
        );
      });
      setReviewsJSX(totalReviews);
    }
  }, [reviewsData]);
  const loadMore = async () => {
    const start = reviewsData.reviews.length;
    const url = `/ratings/reviews/${contentID}?start=${start}&ignoreCount=1`;
    try {
      const { data } = await get(url);
      setReviewsData({
        ...reviewsData,
        reviews: reviewsData.reviews.concat(data.reviews),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ModalLayout open={open} onOpenChange={onOpenChange}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" tag="h2" id="comments-modal-title">
          Reviews for {contentID}
        </Typography>
      </ModalHeader>
      <ModalBody>
        {!reviewsJSX ? (
          <Box background="neutral0" borderColor="neutral200" hasRadius={true} padding={6}>
            <Typography>Loading reviews...</Typography>
          </Box>
        ) : !reviewsJSX.length ? (
          <Box background="neutral0" borderColor="neutral200" hasRadius={true} padding={6}>
            <Typography>There are no reviews yet.</Typography>
          </Box>
        ) : (
          <Flex>
            {reviewsJSX}
            {reviewsJSX.length < reviewsData.reviewsCount && (
              <Button variant="secondary" onClick={loadMore}>
                Load more reviews
              </Button>
            )}
          </Flex>
        )}
      </ModalBody>
      <ModalFooter>
        <ModalClose>
          <Button>Finish</Button>
        </ModalClose>
      </ModalFooter>
    </ModalLayout>
  );
};
