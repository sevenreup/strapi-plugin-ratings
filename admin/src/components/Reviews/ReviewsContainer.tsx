import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Flex,
  Button,
  Typography,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
} from '@strapi/design-system';
import { Review } from './Review';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import { ISOToISO9075 } from '../../utils/date-format';
import { ModalLayout, ModalHeader, ModalBody, ModalFooter, ModalClose } from '../ui/modal';
// import ReactStarsRating from 'react-awesome-stars-rating';

const ROW_COUNT = 6;
const COL_COUNT = 10;

const ReviewsContainer = ({
  data,
  actionDelete,
  actionAdd,
}: {
  data: any;
  actionDelete: any;
  actionAdd: any;
}) => {
  const { get } = useFetchClient();
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    if (data) {
      const reviewsJSX = data.reviews.map((review: any) => {
        return <ReviewRow data={review} key={review.id} actionDelete={actionDelete} />;
      });
      setReviews(reviewsJSX);
    }
  }, [data]);
  const loadMore = async () => {
    const start = data.reviews.length;
    const url = `/ratings?start=${start}&ignoreCount=1`;
    try {
      const res = await get(url);
      const { reviews } = res.data;
      actionAdd(reviews);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {!data.reviews || !data.reviews.length ? (
        <Typography variant="beta">There are no reviews yet</Typography>
      ) : (
        reviews && (
          <Flex>
            <Typography variant="beta">
              Viewing {data.reviews.length} of {data.reviewsCount} reviews
            </Typography>
            <Table colCount={COL_COUNT} rowCount={ROW_COUNT}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography fontWeight="bold">ID</Typography>
                  </Th>
                  <Th>
                    <Typography fontWeight="bold">Author</Typography>
                  </Th>
                  <Th>
                    <Typography fontWeight="bold">Comment</Typography>
                  </Th>
                  <Th>
                    <Typography fontWeight="bold">Score</Typography>
                  </Th>
                  <Th>
                    <Typography fontWeight="bold">Content ID</Typography>
                  </Th>
                  <Th>
                    <Typography fontWeight="bold">Date</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>{reviews}</Tbody>
            </Table>
            {data.reviews.length < data.reviewsCount && (
              <Button variant="secondary" onClick={loadMore}>
                Load more reviews
              </Button>
            )}
          </Flex>
        )
      )}
    </>
  );
};

export default ReviewsContainer;

const ReviewModal = ({
  data,
  open,
  onOpenChange,
  actionDelete,
}: {
  data: any;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  actionDelete: any;
}) => {
  const { del } = useFetchClient();
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const handleDelete = async () => {
    const url = `/ratings/reviews/${data.id}`;
    setDeleting(true);
    try {
      const res = await del(url);
      const { ok } = res.data;
      if (!ok) {
        throw res;
      }
      actionDelete(data.id);
    } catch (err) {
      console.log(err);
      setDeleting(false);
    }
  };

  return (
    <>
      <ModalLayout open={open} onOpenChange={onOpenChange}>
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" tag="h2" id="title">
            {data.related_to.slug}
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Review data={data} />
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={() => setDeleteModal(true)}>
            Delete review
          </Button>
          <ModalClose>
            <Button>Finish</Button>
          </ModalClose>
        </ModalFooter>
      </ModalLayout>
      <ModalLayout open={deleteModal} onOpenChange={setDeleteModal}>
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" tag="h2" id="delete-title">
            Delete review {data.id} and associated score
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Box paddingBottom={6}>
            <Typography variant="beta">
              Are you sure you want to delete this review and associated score?
            </Typography>
            <Typography textColor="neutral800" tag="h5">
              This action cannot be undone
            </Typography>
          </Box>
          <Flex>
            <Button onClick={() => setDeleteModal(false)}>Back</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting ? true : undefined}>
              Delete
            </Button>
          </Flex>
        </ModalBody>
      </ModalLayout>
    </>
  );
};

const ReviewRow = ({ data, actionDelete }: { data: any; actionDelete: any }) => {
  const [modalOpen, setModalOpen] = useState(false);
  let contentSummary = data.comment;
  if (data.comment && data.comment.length > 25) {
    contentSummary = data.comment.slice(0, 25);
    contentSummary += '...';
  }
  const TableRow = styled(Tr)`
    &:hover {
      cursor: pointer;
      background: #d3d3d3;
    }
  `;
  const closeModal = (e: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setModalOpen((prev) => !prev);
  };
  return (
    <TableRow onClick={() => setModalOpen(true)}>
      <Td>
        {data.id}
        <ReviewModal
          data={data}
          open={modalOpen}
          onOpenChange={setModalOpen}
          actionDelete={actionDelete}
        />
      </Td>
      <Td>{data.author.username}</Td>
      <Td>{contentSummary}</Td>
      <Td>
        {/* <ReactStarsRating isEdit={false} isHalf={true} value={data.score} isArrowSubmit={false} /> */}
      </Td>
      <Td>{data.related_to.slug}</Td>
      <Td>{ISOToISO9075(data.createdAt)}</Td>
    </TableRow>
  );
};
