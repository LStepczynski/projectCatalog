import React, { useState, ChangeEvent, FormEvent } from 'react';

import { capitalize } from '@utils/capitalize';
import { fetchWrapper } from '@utils/fetchWrapper';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

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
  EyeIcon,
  EyeClosedIcon,
} from '@primer/octicons-react';

interface FormData {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
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
    const { username, password } = formData;

    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('All fields must be filled.');
      return false;
    }

    if (password.length < 8) {
      setErrorMessage('Invalid login credentials.');
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
      const response = await fetchWrapper(`${backendUrl}/user/sign-in`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.status !== 200) {
        setErrorMessage(capitalize(response.response.message) + '.');
        return;
      }

      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
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
          Sign In
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

        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Link sx={{ width: '40%', textAlign: 'center' }} href="/sign-up">
            Sign Up
          </Link>

          <PasswordReset username={formData.username} />
        </Box>

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
            'Sign In'
          )}
        </Button>
      </Box>
    </Box>
  );
};

interface PasswordResetProps {
  username: string;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ username }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleClick = async () => {
    if (username.trim() === '') return;

    try {
      const response = await fetchWrapper(
        `${backendUrl}/user/forgot-password`,
        {
          method: 'POST',
          body: JSON.stringify({ username: username.trim() }),
        }
      );

      ShowInformationPopup('Forgot Password', response.response.message);
    } catch (err: any) {
      console.error('Password reset error:', err);
      ShowInformationPopup(
        'Forgot Password',
        capitalize(err.message || 'An error occurred') + '.'
      );
    }
  };

  return (
    <>
      <Link
        onClick={handleClick}
        sx={{ cursor: 'pointer', width: '40%', textAlign: 'center' }}
      >
        Forgot Password
      </Link>
    </>
  );
};
