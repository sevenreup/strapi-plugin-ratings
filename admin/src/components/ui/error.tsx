import { Status } from '@strapi/design-system';

type Props = {
  error: Error | null;
};

const ErrorView = ({ error }: Props) => {
  if (error == null) {
    return <></>;
  }
  return <Status variant="danger">{error.message}</Status>;
};

export default ErrorView;
