import { FieldSchema, validateSchema } from '@utils/index';

const schema: Record<string, FieldSchema> = {
  id: {
    type: 'string',
    required: true,
  },
  visibility: {
    type: 'enum',
    required: true,
    enumValues: ['public', 'private'],
  },
};

export const validGetBody = (obj: any) => {
  return validateSchema(obj, schema);
};
