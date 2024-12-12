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
    required: true,
    elementType: 'string',
  },
  image: {
    type: 'string',
    required: true,
  },
  difficulty: {
    type: 'enum',
    required: true,
    enumValues: ['Hard', 'Medium', 'Easy'],
  },
  status: {
    type: 'enum',
    required: false,
    enumValues: ['Private', 'In Review'],
  },
};

export const validCreateMetadata = (obj: any) => {
  return validateSchema(obj, schema);
};
