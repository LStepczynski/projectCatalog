import { useParams } from 'react-router-dom';

import { getUser } from '@utils/getUser';

import { useScreenWidth } from '@hooks/useScreenWidth';
import { useFetchData } from '@hooks/useFetchData';

import { SkeletonCategoryPanel } from '@components/common/skeletons/skeletonCategoryPanel';
import { Separator } from '@components/animation/separator';

import { ArticleRender } from '@pages/myArticles/components/main/articleRender';
import { CreateButton } from '@pages/myArticles/components/main/createButton';

import { Box, Heading, Pagination } from '@primer/react';
import { isInteger } from '@utils/isInteger';

export const MyArticles = () => {
  const screenWidth = useScreenWidth();
  const { page } = useParams();
  if (!page || !isInteger(page)) {
    window.location.href = '/myArticles/1';
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();
  if (
    user &&
    !(user.roles.includes('publisher') || user.roles.includes('admin'))
  ) {
    return (window.location.href = '/');
  }

  const { data: publicArticles } = useFetchData<[]>(
    `${backendUrl}/articles/author/${user!.username}?page=${page}`,
    [],
    {},
    true,
    60 * 15
  );

  const { data: privateArticles } = useFetchData<[]>(
    `${backendUrl}/articles/author/${user!.username}?private=true`,
    [],
    {},
    true,
    60 * 15
  );

  return (
    <Box
      sx={{
        display: 'grid',
        justifyItems: 'center',
        width: '100%',
        mt: '70px',
        gap: 2,
        mb: '100px',
      }}
    >
      {/* Title */}
      <Heading sx={{ fontSize: screenWidth < 768 ? '28px' : '42px' }}>
        Your Articles
      </Heading>

      <Separator />

      {/* Article display */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          width: '90%',
          mt: 4,
        }}
      >
        {publicArticles && privateArticles ? (
          <>
            <ArticleRender
              publicArticles={publicArticles}
              privateArticles={privateArticles}
            />

            <CreateButton user={user} />
          </>
        ) : (
          <SkeletonCategoryPanel bigArticles={false} />
        )}
      </Box>

      {/* Pagination buttons */}
      <Pagination
        currentPage={Number(page) || 1}
        pageCount={99}
        hrefBuilder={(page) => {
          return `/myArticles/${page}`;
        }}
      />
    </Box>
  );
};
