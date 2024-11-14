import { PortalWrapper } from '@components/common/popups/portalWrapper';

import { PasswordChangeForm } from './passwordChangeForm';

import { Box } from '@primer/react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
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
          onClick={onClose}
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
        <PasswordChangeForm onClose={onClose} />
      </Box>
    </PortalWrapper>
  ) : null;
};
