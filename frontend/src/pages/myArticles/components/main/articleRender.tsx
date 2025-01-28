import { ArticlePrivate } from '@components/articles/articlePrivate';
import { ArticleSmall } from '@components/articles/articleSmall';

interface Props {
  publicArticles: any[];
  privateArticles: any[];
}

export const ArticleRender = (props: Props) => {
  const { publicArticles, privateArticles } = props;

  return (
    <>
      {publicArticles.map((item: any, index: any) => (
        <ArticleSmall key={index} article={item} />
      ))}
      {privateArticles.map((item: any, index: any) => (
        <ArticlePrivate key={index} article={item} />
      ))}
    </>
  );
};
