import React from 'react';

import { usePasswordChange } from '@pages/account/hooks/usePasswordChange';

import { Separator } from '@components/animation/separator';

import { Box, Text, Button, TextInput } from '@primer/react';

export const PasswordChangeForm: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const {
    currentPassword,
    newPassword,
    confirmNewPassword,
    isSubmitting,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    changePassword,
  } = usePasswordChange(onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await changePassword();
  };

  return (
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
        Password Change
      </Text>

      <Separator sx={{ px: 3, my: 2 }} />

      <Text>Old Password:</Text>
      <TextInput
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <Text>New Password:</Text>
      <TextInput
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <Text>Confirm New Password:</Text>
      <TextInput
        type="password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        required
      />

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
          sx={{ width: '30%' }}
          variant="danger"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </Button>
      </Box>
    </Box>
  );
};
