import { FieldSchema, validateSchema } from '@utils/index';

const schema: Record<string, FieldSchema> = {
  id: {
    type: 'string',
    required: true,
  },
  visibility: {
    type: 'string',
    required: true,
    enumValues: ['public', 'private'],
  },
};

export const validDeleteBody = (obj: any) => {
  return validateSchema(obj, schema);
};
