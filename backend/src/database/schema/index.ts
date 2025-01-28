import articlesUnpublishedSchema from '@database/schema/ArticlesUnpublished';
import articlesPublishedSchema from '@database/schema/ArticlesPublished';
import tokensSchema from '@database/schema/Tokens';
import usersSchema from '@database/schema/Users';
import likesSchema from '@database/schema/Likes';

export const tables = [
  articlesPublishedSchema,
  articlesUnpublishedSchema,
  tokensSchema,
  likesSchema,
  usersSchema,
];

export type TableSchemas = typeof tables;
