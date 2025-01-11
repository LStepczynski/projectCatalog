import React from 'react';

import { CategorySelection } from '@pages/create/components/categorySelection';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { Box, TextInput, Textarea, Text } from '@primer/react';
import { Separator } from '@components/animation/separator';

interface FormData {
  title: string;
  description: string;
  body: string;
  category: string;
  difficulty: string;
  image: string;
  tags: string[];
}

interface FormProps {
  formData: FormData;
  setFormData: any;
}

export const ArticleCreationForm = (props: FormProps) => {
  const [charCount, setCharCount] = React.useState<any>(0);
  const { formData, setFormData } = props;
  const screenWidth = useScreenWidth();

  const maxBodyLength = 10000;
  const handleBodyChange = (event: any) => {
    const { value } = event.target;
    setCharCount(value.length);
    setFormData((prevData: Record<string, any>) => ({
      ...prevData,
      body: value,
    }));
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
        value={formData.title}
        onChange={(event) => {
          setFormData((prevData: any) => ({
            ...prevData,
            title: event.target.value,
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
        value={formData.description}
        onChange={(event) => {
          setFormData((prevData: any) => ({
            ...prevData,
            description: event.target.value,
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
      <CategorySelection formData={formData} setFormData={setFormData} />

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
          value={formData.body}
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
