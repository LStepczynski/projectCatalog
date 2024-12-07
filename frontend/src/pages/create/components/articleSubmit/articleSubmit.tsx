import { ShowConfirmationPopup } from '@components/common/popups/confirmationPopup';
import { useArticleSubmit } from '@pages/create/hooks/useArticleSubmit';
import { Box, Text, Button, Link } from '@primer/react';

interface FormData {
  Title: string;
  Description: string;
  Body: string;
  PrimaryCategory: string;
  Difficulty: string;
  S3Link: string;
}

interface SubmitProps {
  formData: FormData;
  user: any;
  bannerFile: any;
  tags: string[];
  setSaved: any;
}

export const ArticleSubmit = (props: SubmitProps) => {
  const { handleSubmit } = useArticleSubmit(props);

  const onSave = () => {
    handleSubmit('private');
  };

  const onSubmit = () => {
    ShowConfirmationPopup(
      // Title
      'Publish Article?',
      // Popup content
      <Text>
        Your article will have to be revised and approved before being
        published. <br></br>
        <br></br>
        Visit our{' '}
        <Link href="/faq" target="_blank">
          FAQ page
        </Link>{' '}
        to see if this article meets our standards.
      </Text>,
      // On decline
      () => {},
      // On Accept
      () => {
        handleSubmit('review');
      }
    );
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 5,
        }}
      >
        {/* Save */}
        <Button
          onClick={onSave}
          variant="primary"
          sx={{ fontSize: '18px', p: 3, width: '100px' }}
        >
          Save
        </Button>

        {/* Submit */}
        <Button
          onClick={onSubmit}
          sx={{ fontSize: '18px', p: 3, width: '100px' }}
        >
          Submit
        </Button>
      </Box>
    </>
  );
};