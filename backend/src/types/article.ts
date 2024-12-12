interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  likes: number;
  image: string;
  difficulty: 'Hard' | 'Medium' | 'Easy';

  author: string;
  authorProfilePicture: string;

  createdAt: number;
  lastEdited: number;
}

export interface PublicArticle extends Article {
  publishedAt: number;
}

export interface PrivateArticle extends Article {
  status: 'Private' | 'In Review';
}

export interface ArticleInput
  extends Omit<Article, 'createdAt' | 'lastEdited' | 'deleted'> {}
