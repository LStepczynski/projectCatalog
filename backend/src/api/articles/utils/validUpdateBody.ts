import { FieldSchema, validateSchema } from '@utils/index';

const schema: Record<string, FieldSchema> = {
  id: {
    type: 'string',
    required: true,
  },
  title: {
    type: 'string',
    required: false,
  },
  description: {
    type: 'string',
    required: false,
  },
  category: {
    type: 'string',
    required: false,
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
    required: false,
    enumValues: ['Hard', 'Medium', 'Easy'],
  },
  body: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'enum',
    required: false,
    enumValues: ['Private', 'In Review'],
  },
};

export const validUpdateBody = (obj: any) => {
  return validateSchema(obj, schema);
};
