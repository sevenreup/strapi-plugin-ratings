import { useState } from 'react';
import { Flex, Button, Box, Typography } from '@strapi/design-system';
import { ModalLayout, ModalHeader, ModalBody, ModalFooter, ModalClose } from '../ui/modal';
import { ISOToFull } from '../../utils/date-format';
// import ReactStarsRating from 'react-awesome-stars-rating';
import { useFetchClient } from '@strapi/admin/strapi-admin';

export const Review = ({
  data,
  showDeleteButton,
  actionDelete,
}: {
  data: any;
  showDeleteButton?: any;
  actionDelete?: any;
}) => {
  const { del } = useFetchClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState(false);
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
  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };
  return (
    <>
      <Box paddingTop={4} paddingBottom={4}>
        <Box paddingBottom={4}>
          <Box paddingBottom={2}>
            <Flex>
              <Typography fontWeight="bold">Review {data.id}:</Typography>
              <Typography fontWeight="bold">{data.author.username}</Typography>
              <Typography>
                {'\t'} on {ISOToFull(data.createdAt)}
              </Typography>
              {showDeleteButton && (
                <Button variant="danger" onClick={openDeleteModal}>
                  delete
                </Button>
              )}
            </Flex>
          </Box>
          <Box background="neutral0" paddingBottom={3}>
            <Flex>
              <Typography>Score: {data.score} / 5</Typography>
              {/* <ReactStarsRating
                isEdit={false}
                isHalf={true}
                value={data.score}
                isArrowSubmit={false}
              /> */}
            </Flex>
          </Box>
          {data.comment && (
            <Box background="neutral0" borderColor="neutral200" hasRadius={true} padding={6}>
              <Typography>{data.comment}</Typography>
            </Box>
          )}
        </Box>
      </Box>
      {deleteModalOpen && (
        <DeleteModal
          headerContent={`Delete Review ${data.id} and associated score`}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          deleting={deleting}
          handleDelete={handleDelete}
        >
          <Box paddingTop={5} paddingBottom={5}>
            <Typography variant="beta">
              Are you sure you want to delete this review and associated score?
            </Typography>
            <Typography textColor="neutral800" tag="h5">
              This action cannot be undone
            </Typography>
          </Box>
        </DeleteModal>
      )}
    </>
  );
};

const DeleteModal = ({
  headerContent,
  children,
  handleDelete,
  open,
  onOpenChange,
  deleting,
}: {
  headerContent: any;
  children: any;
  handleDelete: any;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  deleting: any;
}) => {
  return (
    <ModalLayout open={open} onOpenChange={onOpenChange}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" tag="h2" id="delete-title">
          {headerContent}
        </Typography>
      </ModalHeader>
      <ModalBody>
        <Box paddingBottom={6}>{children}</Box>
        <Flex>
          <ModalClose>
            <Button variant="tertiary">Cancel</Button>
          </ModalClose>
          <Button variant="danger" onClick={handleDelete} loading={deleting ? true : undefined}>
            Delete
          </Button>
        </Flex>
      </ModalBody>
    </ModalLayout>
  );
};
