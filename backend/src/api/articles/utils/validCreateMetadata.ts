type FieldType = 'string' | 'number' | 'array' | 'enum';

interface FieldSchema {
  type: FieldType;
  required: boolean;
  enumValues?: any[]; // For fields with specific allowed values
  elementType?: FieldType; // For array element validation
}

const validateSchema: Record<string, FieldSchema> = {
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
  if (obj == null || typeof obj !== 'object') {
    return false; // Ensure `obj` is non-null and an object
  }

  // Validate against the schema
  for (const [key, schema] of Object.entries(validateSchema)) {
    const value = obj[key];

    // Check required fields
    if (schema.required && !(key in obj)) {
      return false;
    }

    // Skip validation for undefined optional fields
    if (value === undefined) {
      continue;
    }

    // Check type
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') return false;
        break;
      case 'number':
        if (typeof value !== 'number') return false;
        break;
      case 'array':
        if (!Array.isArray(value)) return false;
        if (schema.elementType) {
          if (!value.every((el) => typeof el === schema.elementType))
            return false;
        }
        break;
      case 'enum':
        if (!schema.enumValues?.includes(value)) return false;
        break;
      default:
        return false; // Unknown type
    }
  }

  // Ensure no additional fields exist
  const allowedKeys = new Set(Object.keys(validateSchema));
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) {
      return false; // Found an unexpected field
    }
  }

  return true;
};
