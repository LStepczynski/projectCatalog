import { Box } from '@primer/react';

import { capitalize } from '@utils/capitalize';

import { useRenderHelp } from './hooks/useRenderHelp';

import { CategoryHeader } from '@pages/categories/components/main/categoryHeader';
import { SkeletonCategoriesPanel } from '@pages/categories/components/main/skeletonCategoriesPanel';
import { useFetchCategories } from './hooks/useFetchCategories';

export const Categories = () => {
  const { categories, isLoading } = useFetchCategories();

  const { getArticlesToRender, getHeaderWidth } = useRenderHelp(categories);

  // Return skeletons if still fetching
  if (isLoading) {
    Object.keys(categories).map((keyName: string) => {
      return (
        <SkeletonCategoriesPanel headerWidth={getHeaderWidth()} key={keyName} />
      );
    });
  }

  return (
    <Box>
      {/* Iterate over the categories and render the articles */}
      {Object.keys(categories).map((keyName: string) => {
        // Render nothing if there are no articles in a category
        if (categories[keyName].length == 0) {
          return null;
        }

        return (
          <Box
            key={keyName}
            sx={{ mt: '50px', display: 'grid', justifyItems: 'center' }}
          >
            <Box
              sx={{
                width: getHeaderWidth(), // width based on screen size
                mx: 3,
              }}
            >
              {/* Category title */}
              <CategoryHeader
                title={capitalize(keyName)}
                link={`/categories/${keyName}/1`}
              />
            </Box>

            {/* Render the category articles */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              {getArticlesToRender(keyName)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
