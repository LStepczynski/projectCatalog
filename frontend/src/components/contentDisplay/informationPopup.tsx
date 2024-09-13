import { Box, Text, Button } from '@primer/react';
import { PortalWrapper } from '../core/portalWrapper';

interface Props {
  title: string;
  description: string;
  closeFunc: any;
  isOpen: boolean;
}

export const InformationPopup = (props: Props) => {
  const { title, description, closeFunc, isOpen } = props;

  return isOpen ? (
    <PortalWrapper>
      <Box
        sx={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          display: 'flex',
          height: '100vh',
          width: '100vw',
          zIndex: 1000,
          left: 0,
          top: 0,
        }}
      >
        <Box
          onClick={closeFunc}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            height: '100vh',
            width: '100vw',
            zIndex: -1,
            left: 0,
            top: 0,
          }}
        ></Box>
        <Box
          sx={{
            backgroundColor: 'canvas.default',
            border: 'solid 1px',
            borderColor: 'ansi.black',
            borderRadius: '10px',
            position: 'relative',
            width: '330px',
            px: 4,
            py: 3,
          }}
        >
          <Text sx={{ fontSize: '22px' }}>{title}</Text>
          <Box
            sx={{
              width: '100%',
              height: '1px',
              backgroundColor: 'ansi.black',
              px: 3,
              my: 2,
            }}
          ></Box>
          <Text>{description}</Text>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              mb: 2,
            }}
          >
            <Button sx={{ width: '30%' }} variant="primary" onClick={closeFunc}>
              Okay
            </Button>
          </Box>
        </Box>
      </Box>
    </PortalWrapper>
  ) : null;
};
