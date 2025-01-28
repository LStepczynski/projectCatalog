import React from 'react';

import { Box, Button, Text, Heading, Link, Spinner } from '@primer/react';

import { RegisterForm } from '@pages/register/components/registerForm';
import { useFormSubmit } from '@pages/register/hooks/useFormSubmit';

export const Register: React.FC = () => {
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
          width: '350px',
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
          Sign Up
        </Heading>

        {/* Register form */}
        <RegisterForm setFormData={setFormData} formData={formData} />

        {/* Redirect to sign in */}
        <Text sx={{ textAlign: 'center' }}>
          Have an account? • <Link href="/sign-in">Sign In</Link>
        </Text>

        {/* Error message */}
        {errorMessage && (
          <Text
            sx={{
              color: 'red',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </Text>
        )}

        {/* Submit Button  */}
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
            'Sign Up'
          )}
        </Button>
      </Box>
    </Box>
  );
};
