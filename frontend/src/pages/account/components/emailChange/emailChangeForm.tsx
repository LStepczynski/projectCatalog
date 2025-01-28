import React from 'react';

import { useEmailChange } from '@pages/account/hooks/useEmailChange';

import { Separator } from '@components/animation/separator';

import { Box, Text, Button, TextInput } from '@primer/react';

export const EmailChangeForm: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const {
    currentPassword,
    newEmail,
    isSubmitting,
    setCurrentPassword,
    setNewEmail,
    changeEmail,
  } = useEmailChange(onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await changeEmail();
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
      {/* Title */}
      <Text
        sx={{
          fontSize: '22px',
          textAlign: 'center',
        }}
      >
        Change Email Address
      </Text>

      <Separator sx={{ px: 3, my: 2 }} />

      {/* Password Field */}
      <Text>Current Password:</Text>
      <TextInput
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      {/* Email Field */}
      <Text>New Email Address:</Text>
      <TextInput
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        required
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
          sx={{
            width: '30%',
          }}
          variant="danger"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Change Email'}
        </Button>
      </Box>
    </Box>
  );
};
