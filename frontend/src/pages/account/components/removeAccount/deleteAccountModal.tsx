import React from 'react';

import { useDeleteAccount } from '@pages/account/hooks/useDeleteAccount';

import { PortalWrapper } from '@components/common/popups/portalWrapper';

import { Box, Text, Button, TextInput } from '@primer/react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [password, setPassword] = React.useState('');
  const { isSubmitting, handleDeleteAccount } = useDeleteAccount();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDeleteAccount(password, backendUrl, onClose);
  };

  if (!isOpen) return null;

  return (
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
        {/* Overlay to close the modal when clicked outside */}
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

        {/* Modal Content */}
        <Box
          as="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: 'canvas.default',
            border: 'solid 1px',
            borderColor: 'ansi.black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: '10px',
            position: 'relative',
            width: '330px',
            px: 4,
            gap: 2,
            py: 3,
          }}
        >
          <Text sx={{ fontSize: '22px', textAlign: 'center' }}>
            Delete Account
          </Text>
          <Box
            sx={{
              width: '100%',
              height: '1px',
              backgroundColor: 'ansi.black',
              px: 3,
              my: 2,
            }}
          ></Box>

          {/* Password Input */}
          <Text>Confirm Password:</Text>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {/* Submit Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              mb: 2,
            }}
          >
            <Button
              type="submit"
              sx={{ width: '40%' }}
              variant="danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </Box>
        </Box>
      </Box>
    </PortalWrapper>
  );
};
