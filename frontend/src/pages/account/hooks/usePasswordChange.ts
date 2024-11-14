import { useState } from 'react';
import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { ShowInformationPopup } from '@components/common/popups/informationPopup';
import { getUser } from '@utils/getUser';

export const usePasswordChange = (onClose: () => void) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = getUser();

  const validateForm = () => {
    // Check for password fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      ShowInformationPopup('Error', 'All fields are required.');
      return false;
    }

    // Check if the passwords match
    if (newPassword !== confirmNewPassword) {
      ShowInformationPopup(
        'Error',
        'New password and confirmation do not match.'
      );
      return false;
    }

    // Check for minimum password lenght
    if (newPassword.length < 8) {
      ShowInformationPopup(
        'Error',
        'New password must be at least 8 characters long.'
      );
      return false;
    }

    // Check if the user didn't change their password recently
    if (
      !(
        typeof user?.LastPasswordChange == 'number' &&
        user.LastPasswordChange + 15 * 60 < Math.floor(Date.now() / 1000)
      )
    ) {
      ShowInformationPopup(
        'Password Reset',
        'You have requested too many password changes. Please try later.'
      );
      return false;
    }

    return true;
  };

  const changePassword = async () => {
    // Validations
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Send request
      const response = await fetchWrapper(
        `${backendUrl}/user/change-password`,
        {
          method: 'POST',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      // Show a popup with the response
      if (response.status === 200) {
        ShowInformationPopup(
          'Success',
          'Your password has been changed successfully.'
        );
        onClose();
      } else {
        ShowInformationPopup('Error', capitalize(response.response.message));
      }
    } catch (error) {
      ShowInformationPopup(
        'Error',
        'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentPassword,
    newPassword,
    confirmNewPassword,
    isSubmitting,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    changePassword,
  };
};
