import React from 'react';

import { MultipleChoice } from '@pages/create/components/multipleChoice';

import { useScreenWidth } from '@hooks/useScreenWidth';

import { categories } from '@config/categories';

import { Box, Text, Select } from '@primer/react';

import { tags as availableTags } from '@config/tags';

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

// Allows for category, tag, and difficulty configuration
export const CategorySelection = (props: FormProps) => {
  const { formData, setFormData } = props;

  const [open, setOpen] = React.useState<boolean>(false);
  const screenWidth = useScreenWidth();

  const updateTags = (newTags: string[]) => {
    setFormData((prevFormData: Record<string, any>) => ({
      ...prevFormData,
      tags: newTags,
    }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: screenWidth < 768 ? 'column' : 'row',
        gap: 5,
        justifyContent: 'space-around',
        alignItems: 'center',
        width: screenWidth < 768 ? '85%' : '75%',
      }}
    >
      {/* Category */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: screenWidth < 768 ? 'row' : 'column',
          alignItems: screenWidth < 768 ? 'center' : 'left',
          gap: screenWidth < 768 ? 3 : 1,
        }}
      >
        <Text sx={{ opacity: 0.6, fontSize: '14px' }}>Category:</Text>
        <Select
          value={formData.category}
          // Update the value of formData on change
          onChange={(event) => {
            setFormData((prevData: any) => ({
              ...prevData,
              category: event.target.value,
            }));
          }}
        >
          {/* Iterate over all categories and render them */}
          {categories.map((item: any) => {
            return (
              <Select.Option key={item.name} value={item.value}>
                {item.name}
              </Select.Option>
            );
          })}
        </Select>
      </Box>

      {/* Tags */}
      <MultipleChoice
        text="Secondary Categories"
        setSelected={updateTags}
        selected={formData.tags}
        setOpen={setOpen}
        maxSelected={3}
        items={availableTags}
        open={open}
        label="Pick Three Tags"
      />

      {/* Difficulty */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: screenWidth < 768 ? 'row' : 'column',
          alignItems: screenWidth < 768 ? 'center' : 'left',
          gap: screenWidth < 768 ? 3 : 1,
        }}
      >
        <Text sx={{ opacity: 0.6, fontSize: '14px' }}>Difficulty:</Text>
        <Select
          value={formData.difficulty}
          // Update formData on change
          onChange={(event) => {
            setFormData((prevData: any) => ({
              ...prevData,
              difficulty: event.target.value,
            }));
          }}
        >
          <Select.Option value="Easy">Easy</Select.Option>
          <Select.Option value="Medium">Medium</Select.Option>
          <Select.Option value="Hard">Hard</Select.Option>
        </Select>
      </Box>
    </Box>
  );
};
