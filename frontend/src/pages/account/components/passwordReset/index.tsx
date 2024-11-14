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
    if (user?.Verified != 'true') return;

    // Check if user did not request a password change recently
    if (
      !(
        typeof user.LastPasswordChange == 'number' &&
        user.LastPasswordChange + 15 * 60 < Math.floor(Date.now() / 1000)
      )
    ) {
      ShowInformationPopup(
        'Password Reset',
        'You have requested too many password resets. Please try later.'
      );
      return;
    }

    // Send request
    const response = await fetchWrapper(`${backendUrl}/user/password-reset`, {
      method: 'POST',
    });

    // Display the result
    ShowInformationPopup(
      'Password Reset',
      capitalize(response.response.message)
    );
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
