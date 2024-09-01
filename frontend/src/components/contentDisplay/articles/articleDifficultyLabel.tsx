import React from 'react';
import { Label } from '@primer/react';
import { capitalize } from '@helper/helper';

type LabelColorOptions = 'danger' | 'attention' | 'success' | 'default';

export const ArticleDifficultyLabel = ({ value, size = 'large' }: any) => {
  const [variant, setVariant] = React.useState<LabelColorOptions>('default');

  React.useEffect(() => {
    switch (value) {
      case 'EASY':
        setVariant('success');
        break;
      case 'MEDIUM':
        setVariant('attention');
        break;
      case 'HARD':
        setVariant('danger');
        break;
      default:
        setVariant('default');
        break;
    }
  }, [value]);

  return (
    <Label size={size} variant={variant}>
      {capitalize(value.toLowerCase())}
    </Label>
  );
};
