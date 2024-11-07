import { useScreenWidth } from '@hooks/useScreenWidth';

import { SkeletonBox } from '@components/common/skeletons/skeletonBox';

import { Box } from '@primer/react';

export const SkeletonCategoryPanel = ({ bigArticles = true }) => {
  const screenWidth = useScreenWidth();

  const skeletonReturn = () => {
    if (screenWidth < 430 || !bigArticles) {
      return [...Array(10)].map((_, index) => (
        <SkeletonBox key={index} width="310px" height="285px" />
      ));
    }

    if (screenWidth < 1280) {
      return [...Array(10)].map((_, index) => (
        <SkeletonBox key={index} width="380px" height="342px" />
      ));
    }

    return (
      <>
        {[...Array(2)].map((_, index) => (
          <SkeletonBox key={index} width="600px" height="487px" />
        ))}
        {[...Array(8)].map((_, index) => (
          <SkeletonBox key={index} width="380px" height="342px" />
        ))}
      </>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {skeletonReturn()}
    </Box>
  );
};
