import { useState } from 'react';
import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { ShowInformationPopup } from '@components/common/popups/informationPopup';
import { getUser } from '@utils/getUser';

const validatePassword = (pass: string): string => {
  if (pass.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[0-9]/.test(pass)) {
    return 'Password must include at least one number.';
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
    return 'Password must include at least one symbol.';
  }

  if (!/[A-Z]/.test(pass)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (!/[a-z]/.test(pass)) {
    return 'Password must include at least one lowercase letter.';
  }

  return ''; // Return an empty string if the password is valid
};

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
      ShowInformationPopup('Error', 'The new passwords do not match.');
      return false;
    }

    // Check for correct password format
    const passwordCheck = validatePassword(newPassword);
    if (passwordCheck != '') {
      ShowInformationPopup('Error', passwordCheck);
      return false;
    }

    // Check if the user didn't change their password recently
    if (
      !(
        typeof user?.lastPasswordChange == 'number' &&
        user.lastPasswordChange + 15 * 60 < Math.floor(Date.now() / 1000)
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
        `${backendUrl}/users/change-password`,
        {
          method: 'PUT',
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword,
          }),
        }
      );

      // Show a popup with the response
      if (response.status === 'success') {
        ShowInformationPopup(
          'Success',
          'Your password has been changed successfully.'
        );
        onClose();
      } else {
        ShowInformationPopup('Error', capitalize(response.message));
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
