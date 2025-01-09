import React from 'react';

import { useFormSubmit } from '@pages/login/hooks/useFormSubmit';

import { PasswordReset } from '@pages/login/components/main/passwordReset';
import { LoginForm } from '@pages/login/components/loginForm';

import { Box, Button, Text, Heading, Link, Spinner } from '@primer/react';

export const Login: React.FC = () => {
  const { errorMessage, loading, setFormData, formData, handleSubmit } =
    useFormSubmit();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: 'menu.bgActive',
          borderRadius: '10px',
          display: 'grid',
          mt: '10vh',
          gap: 4,
          p: 4,
        }}
      >
        {/* Title */}
        <Heading
          sx={{
            fontSize: '28px',
            textAlign: 'center',
          }}
        >
          Sign In
        </Heading>

        {/* Password and username fileds */}
        <LoginForm setFormData={setFormData} formData={formData} />

        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* Redirect to account creation */}
          <Link sx={{ width: '40%', textAlign: 'center' }} href="/sign-up">
            Sign Up
          </Link>

          {/* Link to reset password */}
          <PasswordReset username={formData.username} />
        </Box>

        {/* Error message */}
        {errorMessage && (
          <Text sx={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            {errorMessage}
          </Text>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading}
          sx={{
            backgroundColor: 'primer.canvas.sticky',
            fontSize: '16px',
            py: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <>
              <Spinner sx={{ mt: 2 }} size="small" />
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </Box>
  );
};
