import { Box, Pagination } from '@primer/react';

import { capitalize } from '@utils/capitalize';

import { useRenderHelp } from './hooks/useRenderHelp';

import { CategoryHeader } from '@pages/categories/components/main/categoryHeader';
import { SkeletonCategoriesPanel } from '@pages/categories/components/main/skeletonCategoriesPanel';
import { useFetchCategories } from './hooks/useFetchCategories';
import { useParams } from 'react-router-dom';
import { NotFound } from '@components/common/notFound';
import { isInteger } from '@utils/isInteger';

export const Categories = () => {
  const { page } = useParams<{ page: string }>();
  if (!page || !isInteger(page)) {
    window.location.href = '/categories/1';
  }

  const { categories, isLoading, maxPage } = useFetchCategories(Number(page));

  const { getArticlesToRender, getHeaderWidth } = useRenderHelp(categories);

  // Return skeletons if still fetching
  if (isLoading || categories === null) {
    return [0, 1, 2, 3].map((key: number) => {
      return (
        <SkeletonCategoriesPanel headerWidth={getHeaderWidth()} key={key} />
      );
    });
  }

  return (
    <Box>
      {/* Iterate over the categories and render the articles */}
      {Object.keys(categories).map((keyName: string) => {
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
            {categories[keyName].length != 0 ? (
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
            ) : (
              <Box
                sx={{
                  mb: 4,
                }}
              >
                <NotFound
                  title="No Articles Found"
                  message="Sorry, no articles have been published yet. Check again later."
                />
              </Box>
            )}
          </Box>
        );
      })}
      <Pagination
        currentPage={Number(page) || 1}
        pageCount={maxPage}
        hrefBuilder={(page) => {
          return `/categories/${page}`;
        }}
      />
    </Box>
  );
};
