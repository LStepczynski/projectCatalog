import React, { useState, ChangeEvent } from 'react';

import { Box, TextInput, Text } from '@primer/react';

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

interface Props {
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  formData: FormData;
}

export const LoginForm = (props: Props) => {
  const { setFormData, formData } = props;

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

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

  const inputStyle = {
    width: '300px',
  };

  return (
    <>
      {/* Username input */}
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

      {/* Password input */}
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
    </>
  );
};
