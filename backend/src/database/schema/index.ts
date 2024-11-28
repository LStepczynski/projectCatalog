import articlesPublishedSchema from '@database/schema/ArticlesPublished';
import articlesUnpublishedSchema from '@database/schema/ArticlesUnpublished';
import tokensSchema from '@database/schema/Tokens';
import usersSchema from '@database/schema/Users';

export const tables = [
  articlesPublishedSchema,
  articlesUnpublishedSchema,
  usersSchema,
  tokensSchema,
];

export type TableSchemas = typeof tables;
