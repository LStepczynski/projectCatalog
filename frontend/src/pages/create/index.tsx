import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { getUser } from '@utils/getUser';
import { ArticleSubmit } from '@pages/create/components/articleSubmit/articleSubmit';
import { useScreenWidth } from '@hooks/useScreenWidth';
import { ArticleCreationForm } from '@pages/create/components/articleCreationForm';
import { HeroInputImage } from '@pages/create/components/heroInputImage';

import { Box, Heading } from '@primer/react';
import { Separator } from '@components/animation/separator';
import useAskLeave from '@hooks/useAskLeave';
import { useFillExistingInfo } from './hooks/useFillExistingInfo';

interface FormData {
  title: string;
  description: string;
  body: string;
  category: string;
  difficulty: string;
  image: string;
  tags: string[];
}

export const Create = () => {
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    body: '',
    category: 'programming',
    difficulty: 'Easy',
    image: '',
    tags: [],
  });

  const articleId = useSearchParams()[0].get('id');
  const screenWidth = useScreenWidth();

  const setSaved = useAskLeave();

  // Check user privliges
  const user = getUser();
  if (
    user &&
    !(user.roles.includes('admin') || user.roles.includes('published'))
  ) {
    return (window.location.href = '/');
  }

  // Fill the form with the existing article data if id is defined
  if (articleId) {
    useFillExistingInfo(articleId, setFormData);
  }

  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '70px',
        gap: 5,
        mb: '100px',
      }}
    >
      <Heading sx={{ fontSize: screenWidth < 768 ? '28px' : '40px' }}>
        Create an Article
      </Heading>

      <Separator sx={{ width: '80%', mb: 2 }} />

      {/* Top of the article - Displays the current selected image and allows for image upload */}
      <HeroInputImage formData={formData} setFormData={setFormData} />

      {/* Article Creation Form */}
      <ArticleCreationForm formData={formData} setFormData={setFormData} />

      {/* Submit and Save Buttons */}
      <ArticleSubmit formData={formData} setSaved={setSaved} />
    </Box>
  );
};
