import { useScreenWidth } from '@hooks/useScreenWidth';

import { ArticleLarge } from '@components/articles/articleLarge';
import { ArticleMedium } from '@components/articles/articleMedium';
import { ArticleSmall } from '@components/articles/articleSmall';

export const useRenderHelp = (categories: any) => {
  const screenWidth = useScreenWidth();

  // Define breakpoints and corresponding component types
  const getComponentByWidth = (width: number) => {
    if (width < 430) return ArticleSmall;
    if (width < 1280) return ArticleMedium;
    return null; // Use null for mixed rendering at larger widths
  };

  const getArticlesToRender = (keyName: string) => {
    const Component = getComponentByWidth(screenWidth);

    // Render with a singular component
    if (Component) {
      return categories[keyName]?.map((item: any, index: any) => (
        <Component key={index} article={item} />
      ));
    }

    // Mixed rendering logic for larger widths
    return (
      <>
        {categories[keyName]?.slice(0, 2).map((item: any, index: any) => (
          <ArticleLarge key={index} article={item} />
        ))}
        {categories[keyName]?.slice(2).map((item: any, index: any) => (
          <ArticleMedium key={index} article={item} />
        ))}
      </>
    );
  };

  const getHeaderWidth = () => {
    if (screenWidth < 430) return '95%';
    if (screenWidth < 500) return '90%';
    if (screenWidth < 1012) return '450px';
    if (screenWidth < 1280) return '900px';
    return '1250px';
  };

  return { getArticlesToRender, getHeaderWidth };
};
