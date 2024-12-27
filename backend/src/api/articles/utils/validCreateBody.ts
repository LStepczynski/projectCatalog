import { FieldSchema, validateSchema } from '@utils/index';

const schema: Record<string, FieldSchema> = {
  title: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: true,
  },
  category: {
    type: 'string',
    required: true,
  },
  tags: {
    type: 'array',
    required: false,
    elementType: 'string',
  },
  image: {
    type: 'string',
    required: false,
  },
  difficulty: {
    type: 'enum',
    required: true,
    enumValues: ['Hard', 'Medium', 'Easy'],
  },
  body: {
    type: 'string',
    required: true,
  },
  status: {
    type: 'enum',
    required: false,
    enumValues: ['Private', 'In Review'],
  },
};

export const validCreateBody = (obj: any) => {
  return validateSchema(obj, schema);
};
