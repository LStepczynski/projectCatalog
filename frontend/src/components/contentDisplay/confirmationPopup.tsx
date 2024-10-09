import { Box, Text, Button } from '@primer/react';
import { ThemeProvider, BaseStyles } from '@primer/react';
import { createRoot } from 'react-dom/client';

interface Props {
  title: string;
  description: string | any;
  onAccept: any;
  onDecline: any;
}

const ConfirmationPopup = (props: Props) => {
  const { title, description, onAccept, onDecline } = props;

  return (
    <ThemeProvider colorMode="dark">
      <BaseStyles>
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
            onClick={onDecline}
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
            {typeof description == 'string' ? (
              <Text>{description}</Text>
            ) : (
              description
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                mt: 4,
                mb: 2,
              }}
            >
              <Button
                sx={{ width: '30%' }}
                variant="danger"
                onClick={onDecline}
              >
                No
              </Button>
              <Button
                sx={{ width: '30%' }}
                variant="primary"
                onClick={onAccept}
              >
                Yes
              </Button>
            </Box>
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
};

export const ShowConfirmationPopup = (
  title: string,
  description: string | any,
  onDecline: any,
  onAccept: any
) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error('No element with ID "modal-root" found in the DOM.');
    return;
  }

  // Create a container div for the alert
  const alertContainer = document.createElement('div');
  modalRoot.appendChild(alertContainer);

  // Create a React root
  const root = createRoot(alertContainer);

  // Function to handle alert dismissal
  const handleClose = () => {
    root.unmount();
    if (modalRoot.contains(alertContainer)) {
      modalRoot.removeChild(alertContainer);
    }
  };

  root.render(
    <ConfirmationPopup
      title={title}
      description={description}
      onDecline={() => {
        handleClose();
        onDecline();
      }}
      onAccept={() => {
        handleClose();
        onAccept();
      }}
    />
  );
};
