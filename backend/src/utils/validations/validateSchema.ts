export type FieldType = 'string' | 'number' | 'array' | 'enum';

export interface FieldSchema {
  type: FieldType;
  required: boolean;
  enumValues?: any[]; // For fields with specific allowed values
  elementType?: FieldType; // For array element validation
}

export const validateSchema = (
  obj: any,
  schema: Record<string, FieldSchema>
): boolean => {
  if (obj == null || typeof obj !== 'object') {
    return false; // Ensure `obj` is non-null and an object
  }

  // Validate against the schema
  for (const [key, fieldSchema] of Object.entries(schema)) {
    const value = obj[key];

    // Check required fields
    if (fieldSchema.required && !(key in obj)) {
      return false; // Required field is missing
    }

    // Skip validation for undefined optional fields
    if (value === undefined) {
      continue;
    }

    // Check field type
    switch (fieldSchema.type) {
      case 'string':
        if (typeof value !== 'string') return false;
        break;
      case 'number':
        if (typeof value !== 'number') return false;
        break;
      case 'array':
        if (!Array.isArray(value)) return false;
        if (fieldSchema.elementType) {
          if (!value.every((el) => typeof el === fieldSchema.elementType))
            return false;
        }
        break;
      case 'enum':
        if (!fieldSchema.enumValues?.includes(value)) return false;
        break;
      default:
        return false; // Unknown type
    }
  }

  // Ensure no additional fields exist
  const allowedKeys = new Set(Object.keys(schema));
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key)) {
      return false; // Found an unexpected field
    }
  }

  return true;
};
