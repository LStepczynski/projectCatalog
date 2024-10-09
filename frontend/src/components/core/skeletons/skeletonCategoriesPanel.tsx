import { Box } from '@primer/react';
import { SkeletonBox } from './skeletonBox';
import { useScreenWidth } from '../../other/useScreenWidth';

interface Props {
  headerWidth: string;
}

export const SkeletonCategoriesPanel = (props: Props) => {
  const screenWidth = useScreenWidth();
  const { headerWidth } = props;

  const skeletonReturn = () => {
    let returnValue;
    if (screenWidth < 430) {
      returnValue = [...Array(5)].map((_, index) => (
        <SkeletonBox key={index} width="310px" height="285px" />
      ));
    } else if (screenWidth < 1280) {
      returnValue = [...Array(5)].map((_, index) => (
        <SkeletonBox key={index} width="380px" height="342px" />
      ));
    } else {
      returnValue = (
        <>
          {[...Array(2)].map((_, index) => (
            <SkeletonBox key={index} width="600px" height="487px" />
          ))}
          {[...Array(3)].map((_, index) => (
            <SkeletonBox key={index} width="380px" height="342px" />
          ))}
        </>
      );
    }

    return (
      <>
        <Box
          sx={{
            width: headerWidth,
            mx: 3,
          }}
        >
          <SkeletonBox width="100%" height="82px" />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            mt: 4,
          }}
        >
          {returnValue}
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ mt: '50px', display: 'grid', justifyItems: 'center' }}>
      {skeletonReturn()}
    </Box>
  );
};
