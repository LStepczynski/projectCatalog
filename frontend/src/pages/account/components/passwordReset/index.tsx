import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { getUser } from '@utils/getUser';

import { ShowConfirmationPopup } from '@components/common/popups/confirmationPopup';
import { ShowInformationPopup } from '@components/common/popups/informationPopup';

import { Button } from '@primer/react';

export const PasswordReset = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const user = getUser();

  const handleResetPassword = async () => {
    // Check if user is verified
    if (!user?.roles.includes('verified')) {
      ShowInformationPopup(
        'Password Reset',
        'You need to verify your account to reset your password.'
      );
      return;
    }

    // Send request
    const response = await fetchWrapper(`${backendUrl}/auth/password-reset`, {
      method: 'POST',
      body: JSON.stringify({ username: user!.username }),
    });

    // Display the result
    ShowInformationPopup('Password Reset', capitalize(response.message));
  };

  return (
    <Button
      onClick={() => {
        ShowConfirmationPopup(
          'Password Reset',
          'Do you want to reset your password?',
          () => {},
          handleResetPassword
        );
      }}
    >
      Reset Password
    </Button>
  );
};
