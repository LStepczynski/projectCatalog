import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { getUser } from '@utils/getUser';
import { fetchWrapper } from '@utils/fetchWrapper';
import { ArticleSubmit } from '@pages/create/components/articleSubmit/articleSubmit';
import { useScreenWidth } from '@hooks/useScreenWidth';
import { ArticleCreationForm } from '@pages/create/components/articleCreationForm';
import { HeroInputImage } from '@pages/create/components/heroInputImage';

import { Box, Heading } from '@primer/react';

export const Create = () => {
  const [bannerFile, setBannerFile] = React.useState<any>([null, null]); // file, link
  const [saved, setSaved] = React.useState(false);
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');
  const screenWidth = useScreenWidth();
  const [tags, setTags] = React.useState([]);
  const [formData, setFormData] = React.useState({
    Title: '',
    Description: '',
    Body: '',
    PrimaryCategory: 'programming',
    Difficulty: 'Easy',
    S3Link: '',
  });

  // Check user privliges
  const user = getUser();
  if (user && !(user.CanPost == 'true' || user.Admin == 'true')) {
    return (window.location.href = '/');
  }

  React.useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (!saved) {
        event.preventDefault();
        event.returnValue = ''; // This is necessary for some browsers to show the prompt.
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saved]);

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (!articleId) {
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    fetchWrapper(
      `${backendUrl}/articles/get?id=${articleId}&visibility=private`,
      { signal },
      true,
      60 * 10
    ).then((data) => {
      const article = data.response.return;
      setFormData({
        Title: article.metadata.Title,
        Description: article.metadata.Description,
        Body: article.body,
        PrimaryCategory: article.metadata.PrimaryCategory,
        Difficulty: article.metadata.Difficulty,
        S3Link: article.metadata.Image,
      });
      setTags(article.metadata.SecondaryCategories);
      setBannerFile((prev: any) => [prev[0], article.metadata.Image]);
    });

    return () => {
      controller.abort();
    };
  }, []);

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
      <Box
        sx={{
          width: '80%',
          height: '1px',
          backgroundColor: 'ansi.black',
          mb: 2,
        }}
      ></Box>

      <HeroInputImage bannerFile={bannerFile} setBannerFile={setBannerFile} />

      <ArticleCreationForm
        tags={tags}
        setTags={setTags}
        formData={formData}
        setFormData={setFormData}
      />

      <ArticleSubmit
        user={user}
        formData={formData}
        bannerFile={bannerFile}
        tags={tags}
        setSaved={setSaved}
      />
    </Box>
  );
};
