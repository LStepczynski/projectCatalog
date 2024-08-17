import {
  Box,
  TextInput,
  Textarea,
  Heading,
  Text,
  Button,
  Select,
} from '@primer/react';

import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { AnimatedImage } from '../components/animation/animatedImage';
import { getUserFromJWT } from '@helper/helper';
import { BannerUploadModal } from '../components/contentDisplay/bannerUploadModal';
import { useScreenWidth } from '../components/other/useScreenWidth';
import { MultipleChoice } from '../components/core/multipleChoice';

export const Create = () => {
  const [bannerFile, setBannerFile] = React.useState<any>([null, null]); // file, link
  const [searchParams, setSearchParams] = useSearchParams();
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
  const user = getUserFromJWT();
  if (user && !(user.CanPost == 'true' || user.Admin == 'true')) {
    return (window.location.href = '/');
  }

  const fetchArticle = async () => {
    if (!articleId) {
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const articleResponse = await fetch(
      `${backendUrl}/articles/get?id=${articleId}&visibility=private`,
      {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem('verificationToken') || ''
          }`,
        },
      }
    );

    try {
      const articleData = await articleResponse.json();
      const article = articleData.response.return;
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
    } catch {
      alert('There was an error while trying to load the article');
    }
  };

  React.useEffect(() => {
    fetchArticle();
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
      />
    </Box>
  );
};

interface HeroProps {
  bannerFile: any;
  setBannerFile: any;
}

const HeroInputImage = (props: HeroProps) => {
  const [uploadModal, setUploadModal] = React.useState<any>(false);
  const [bannerHover, setBannerHover] = React.useState<any>(false);
  const { bannerFile, setBannerFile } = props;

  return (
    <>
      <Box
        onMouseEnter={() => setBannerHover(true)}
        onMouseLeave={() => setBannerHover(false)}
        sx={{
          width: '80%',
          borderRadius: '15px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          onClick={() => {
            setUploadModal(true);
            setBannerHover(false);
          }}
        >
          <img
            style={{
              transform: 'translate(-50%, -50%)',
              opacity: bannerHover ? 0.7 : 0,
              transition: 'all 0.2s',
              position: 'absolute',
              width: '20%',
              left: '50%',
              zIndex: 10,
              top: '50%',
            }}
            src="images/plus.webp"
            alt="Add Image"
          />
          <AnimatedImage
            url={bannerFile[1] || 'images/default2.png'}
            alt="Article image"
          />
        </Box>
        <BannerUploadModal
          bannerFunc={setBannerFile}
          isOpen={uploadModal}
          closeFunc={setUploadModal}
        />
      </Box>
    </>
  );
};

interface FormData {
  Title: string;
  Description: string;
  Body: string;
  PrimaryCategory: string;
  Difficulty: string;
  S3Link: string;
}

interface FormProps {
  formData: FormData;
  setFormData: any;
  tags: string[];
  setTags: any;
}

const ArticleCreationForm = (props: FormProps) => {
  const [charCount, setCharCount] = React.useState<any>(0);
  const { formData, setFormData, tags, setTags } = props;
  const screenWidth = useScreenWidth();

  const maxBodyLength = 4000;
  const handleBodyChange = (event: any) => {
    let newData = formData;
    newData.Body = event.target.value;
    setCharCount(newData.Body.length);
    setFormData(newData);
  };

  const getCharCounterColor = () => {
    if (charCount > maxBodyLength - 50) {
      return 'red';
    }
    if (charCount > maxBodyLength - 150) {
      return 'orange';
    }
    return '';
  };

  return (
    <>
      <TextInput
        maxLength={45}
        value={formData.Title}
        onChange={(event) => {
          setFormData((prevData: any) => ({
            ...prevData,
            Title: event.target.value,
          }));
        }}
        placeholder="Title:"
        sx={{
          width: screenWidth < 768 ? '85%' : '75%',
          fontSize: screenWidth < 768 ? '18px' : '26px',
          p: 2,
        }}
      />
      <Textarea
        placeholder="Description:"
        resize="none"
        value={formData.Description}
        onChange={(event) => {
          setFormData((prevData: any) => ({
            ...prevData,
            Description: event.target.value,
          }));
        }}
        maxLength={368}
        sx={{
          width: screenWidth < 768 ? '85%' : '75%',
          height: '105px',
          fontSize: screenWidth < 768 ? '14px' : '18px',
        }}
      />

      <CategorySelection
        tags={tags}
        setTags={setTags}
        formData={formData}
        setFormData={setFormData}
      />

      <Box
        sx={{
          width: screenWidth < 768 ? '85%' : '75%',
          height: '1px',
          backgroundColor: 'ansi.black',
          my: 3,
        }}
      ></Box>

      <Box
        sx={{
          width: screenWidth < 768 ? '80%' : '60%',
          position: 'relative',
        }}
      >
        <Textarea
          placeholder="Body:"
          resize="none"
          maxLength={maxBodyLength}
          value={formData.Body}
          onChange={handleBodyChange}
          sx={{
            width: '100%',
            height: screenWidth < 768 ? '450px' : '600px',
            fontSize: screenWidth < 768 ? '16px' : '18px',
          }}
        />
        <Text
          sx={{
            position: 'absolute',
            right: 2,
            bottom: 1,
            color: getCharCounterColor(),
          }}
        >
          {charCount}/{maxBodyLength}
        </Text>
      </Box>
    </>
  );
};

const CategorySelection = (props: FormProps) => {
  const { formData, setFormData, tags, setTags } = props;
  const [open, setOpen] = React.useState<boolean>(false);
  const screenWidth = useScreenWidth();
  const items = [
    'innovation',
    'creativity',
    'discovery',
    'experiment',
    'prototyping',
    'tinkering',
    'build',
    'invention',
    'crafting',
    'design',
    'making',
    'exploration',
    'challenge',
    'hands on',
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: screenWidth < 768 ? '85%' : '75%',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ opacity: 0.6, fontSize: '14px' }}>Category:</Text>
        <Select
          value={formData.PrimaryCategory}
          onChange={(event) => {
            setFormData((prevData: any) => ({
              ...prevData,
              PrimaryCategory: event.target.value,
            }));
          }}
        >
          <Select.Option value="programming">Programming</Select.Option>
          <Select.Option value="3d-modeling">3D Modeling</Select.Option>
          <Select.Option value="electronics">Electronics</Select.Option>
          <Select.Option value="woodworking">Woodworking</Select.Option>
          <Select.Option value="chemistry">Chemistry</Select.Option>
          <Select.Option value="cybersecurity">Cybersecurity</Select.Option>
          <Select.Option value="physics">Physics</Select.Option>
        </Select>
      </Box>

      <MultipleChoice
        text="Secondary Categories"
        setSelected={setTags}
        selected={tags}
        setOpen={setOpen}
        maxSelected={3}
        items={items}
        open={open}
        label=""
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Text sx={{ opacity: 0.6, fontSize: '14px' }}>Difficulty:</Text>
        <Select
          value={formData.Difficulty}
          onChange={(event) => {
            setFormData((prevData: any) => ({
              ...prevData,
              Difficulty: event.target.value,
            }));
          }}
        >
          <Select.Option value="EASY">Easy</Select.Option>
          <Select.Option value="MEDIUM">Medium</Select.Option>
          <Select.Option value="HARD">Hard</Select.Option>
        </Select>
      </Box>
    </Box>
  );
};

interface FormData {
  [key: string]: any;
}

interface SubmitProps {
  formData: FormData;
  user: any;
  bannerFile: any;
  tags: string[];
}

const ArticleSubmit = (props: SubmitProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { formData, user, bannerFile, tags } = props;

  // existingId specifies which article is being edited
  const [searchParams, setSearchParams] = useSearchParams();
  const existingId = searchParams.get('id') || '';

  const handleSubmit = async (status: string) => {
    for (const field of Object.keys(formData)) {
      if (field != 'S3Link' && formData[field].trim() == '') {
        alert('Please fill out all of the fields in order to save');
        return;
      }
    }
    if (tags.length == 0) {
      alert('Please fill out all of the fields in order to save');
      return;
    }

    try {
      // Submit article data
      const articleResponse = await fetch(
        `${backendUrl}/articles?id=${existingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${
              localStorage.getItem('verificationToken') || ''
            }`,
          },
          body: JSON.stringify({
            body: formData.Body,
            metadata: {
              Title: formData.Title,
              Description: formData.Description,
              Author: user.Username,
              AuthorProfilePic: user.ProfilePic,
              PrimaryCategory: formData.PrimaryCategory,
              SecondaryCategories: tags,
              Rating: 0,
              Difficulty: formData.Difficulty,
              Image: formData.S3Link,
              Status: status,
            },
          }),
        }
      );

      const articleData = await articleResponse.json();

      if (bannerFile[0] == null) {
        window.location.href = '/myArticles';
        return;
      }
      // Submit image data
      const imageData = new FormData();
      imageData.append('image', bannerFile[0]);
      const articleId = articleData.response.id;
      await fetch(
        `${backendUrl}/articles/image?id=${articleId}&visibility=private`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem('verificationToken') || ''
            }`,
          },
          body: imageData,
        }
      );
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
    window.location.href = '/myArticles';
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 5,
        }}
      >
        <Button
          onClick={() => {
            handleSubmit('private');
          }}
          variant="primary"
          sx={{ fontSize: '18px', p: 3, width: '100px' }}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            handleSubmit('review');
          }}
          sx={{ fontSize: '18px', p: 3, width: '100px' }}
        >
          Publish
        </Button>
      </Box>
    </>
  );
};