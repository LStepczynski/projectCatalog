import { FieldSchema, validateSchema } from '@utils/index';

const schema: Record<string, FieldSchema> = {
  id: {
    type: 'string',
    required: true,
  },
  visibility: {
    type: 'string',
    required: false,
    enumValues: ['public', 'private'],
  },
};

export const validDeleteMetadata = (obj: any) => {
  return validateSchema(obj, schema);
};
