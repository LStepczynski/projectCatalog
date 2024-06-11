import React from 'react';
import { Box, TextInput, Button, Text, Heading, Link } from '@primer/react';

import {
  PersonIcon,
  LockIcon,
  MailIcon,
  EyeIcon,
  EyeClosedIcon,
} from '@primer/octicons-react';

import { capitalize } from '@helper/helper';

export const Login = () => {
  const [passwordIcon, setPasswordIcon] = React.useState<any>(EyeIcon);
  const [passVis, setPassVis] = React.useState<string>('password');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
  });

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const changeIcon = () => {
    if (passwordIcon == EyeClosedIcon) {
      setPasswordIcon(EyeIcon);
      setPassVis('password');
    } else {
      setPasswordIcon(EyeClosedIcon);
      setPassVis('text');
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (Object.values(formData).some((value) => value.trim() == '')) {
      setErrorMessage('All fields must be filled');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Invalid login credentials.');
      return;
    }

    console.log(formData);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    fetch(`${backendUrl}/user/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status != 200) {
          setErrorMessage(capitalize(data.response.message) + '.');
          return;
        }
        localStorage.setItem('verificationToken', data.response.accessToken);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error(error);
        return;
      });
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
          />
        </Box>

        <Box sx={{ display: 'grid' }}>
          <Text sx={{ color: 'fg.muted' }}>Password:</Text>
          <TextInput
            aria-label="Password"
            name="password"
            type={passVis}
            size="large"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            leadingVisual={LockIcon}
            trailingAction={
              <TextInput.Action
                onClick={changeIcon}
                icon={passwordIcon}
                aria-label="Visibility"
              />
            }
            sx={inputStyle}
          />
        </Box>

        <Text sx={{ textAlign: 'center' }}>
          Don't have an account? • <Link href="/sign-up">Sign Up</Link>
        </Text>

        {errorMessage && (
          <Text sx={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            {errorMessage}
          </Text>
        )}
        <Button
          onClick={handleSubmit}
          sx={{
            backgroundColor: 'primer.canvas.sticky',
            fontSize: '16px',
            py: '20px',
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
};
