import React from 'react';

import { CategorySelection } from '@pages/create/components/categorySelection';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { Box, TextInput, Textarea, Text } from '@primer/react';
import { Separator } from '@components/animation/separator';

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

export const ArticleCreationForm = (props: FormProps) => {
  const [charCount, setCharCount] = React.useState<any>(0);
  const { formData, setFormData, tags, setTags } = props;
  const screenWidth = useScreenWidth();

  const maxBodyLength = 10000;
  const handleBodyChange = (event: any) => {
    let newData = formData;
    newData.Body = event.target.value;
    setCharCount(newData.Body.length);
    setFormData(newData);
  };

  // Determines the color of the character counter based on characters left
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
      {/* Title */}
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

      {/* Description */}
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

      {/* Category Tags and Difficulty Selection */}
      <CategorySelection
        tags={tags}
        setTags={setTags}
        formData={formData}
        setFormData={setFormData}
      />

      <Separator sx={{ width: screenWidth < 768 ? '85%' : '75%', my: 3 }} />

      {/* Body input */}
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
