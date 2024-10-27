import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  TextInput,
  Button,
  Text,
  Heading,
  Link,
  Spinner,
} from '@primer/react';

import {
  PersonIcon,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeClosedIcon,
} from '@primer/octicons-react';

import { capitalize, fetchWrapper } from '@helper/helper';

interface FormData {
  username: string;
  password: string;
  email: string;
}

export const Register: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const validateForm = (): boolean => {
    const { username, password, email } = formData;

    if (
      username.trim() === '' ||
      password.trim() === '' ||
      email.trim() === ''
    ) {
      setErrorMessage('All fields must be filled.');
      return false;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }

    // Simple email regex for validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email address.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetchWrapper(`${backendUrl}/user/sign-up`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.status !== 200) {
        setErrorMessage(capitalize(response.response.message) + '.');
        return;
      }

      window.location.href = '/sign-in';
      setFormData({
        username: '',
        password: '',
        email: '',
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(capitalize(err.message || 'An error occurred') + '.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '300px',
  };

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
        <Heading
          sx={{
            fontSize: '28px',
            textAlign: 'center',
          }}
        >
          Sign Up
        </Heading>

        <Box sx={{ display: 'grid' }}>
          <Text sx={{ color: 'fg.muted' }}>Username:</Text>
          <TextInput
            aria-label="Username"
            name="username"
            size="large"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            leadingVisual={PersonIcon}
            sx={inputStyle}
            required
          />
        </Box>

        <Box sx={{ display: 'grid' }}>
          <Text sx={{ color: 'fg.muted' }}>Email:</Text>
          <TextInput
            aria-label="Email"
            name="email"
            size="large"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            leadingVisual={MailIcon}
            sx={inputStyle}
            required
          />
        </Box>

        <Box sx={{ display: 'grid' }}>
          <Text sx={{ color: 'fg.muted' }}>Password:</Text>
          <TextInput
            aria-label="Password"
            name="password"
            type={passwordVisible ? 'text' : 'password'}
            size="large"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            leadingVisual={LockIcon}
            trailingAction={
              <TextInput.Action
                onClick={togglePasswordVisibility}
                icon={passwordVisible ? EyeClosedIcon : EyeIcon}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              />
            }
            sx={inputStyle}
            required
          />
        </Box>

        <Text sx={{ textAlign: 'center' }}>
          Have an account? • <Link href="/sign-in">Sign In</Link>
        </Text>

        {errorMessage && (
          <Text sx={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            {errorMessage}
          </Text>
        )}

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
