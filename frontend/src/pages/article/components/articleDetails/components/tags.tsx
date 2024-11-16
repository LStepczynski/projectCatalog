import { capitalize } from '@utils/capitalize';

import { Box, LabelGroup, Label } from '@primer/react';

export const Tags = ({ tags }: { tags: any[] }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LabelGroup sx={{ justifyContent: 'center' }}>
        {tags.map((item: any, index: any) => (
          <Label sx={{ mx: 1 }} key={index}>
            {capitalize(item)}
          </Label>
        ))}
      </LabelGroup>
    </Box>
  );
};
