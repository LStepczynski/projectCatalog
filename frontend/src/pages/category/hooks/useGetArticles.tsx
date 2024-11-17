import { useScreenWidth } from '@hooks/useScreenWidth';

import { ArticleMedium } from '@components/articles/articleMedium';
import { ArticleLarge } from '@components/articles/articleLarge';
import { ArticleSmall } from '@components/articles/articleSmall';

export const useGetArticles = () => {
  const screenWidth = useScreenWidth();

  // Renders articles with the provided component and list
  const renderArticles = (data: any[], Component: any) =>
    data.map((item: any, index: number) => (
      <Component key={index} article={item} />
    ));

  const getArticlesToRender = (data: any[]) => {
    if (!data) return null;

    if (screenWidth < 430) {
      return renderArticles(data, ArticleSmall);
    }

    if (screenWidth < 1280) {
      return renderArticles(data, ArticleMedium);
    }

    // For larger screens
    return (
      <>
        {renderArticles(data.slice(0, 2), ArticleLarge)}
        {renderArticles(data.slice(2), ArticleMedium)}
      </>
    );
  };

  return { getArticlesToRender };
};
