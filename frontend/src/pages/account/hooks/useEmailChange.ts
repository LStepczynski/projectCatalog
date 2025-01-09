import { useState } from 'react';
import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { ShowInformationPopup } from '@components/common/popups/informationPopup';
import { getUser } from '@utils/getUser';

export const useEmailChange = (onClose: () => void) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const user = getUser();

  const validateForm = () => {
    // Check for password and email fields
    if (!currentPassword || !newEmail) {
      ShowInformationPopup(
        'Error',
        'Current password and new email are required.'
      );
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      ShowInformationPopup('Error', 'Please enter a valid email address.');
      return false;
    }

    // Check if the user didn't change their email recently
    if (
      typeof user?.LastEmailChange === 'number' &&
      user.LastEmailChange + 3 * 60 * 60 >= Math.floor(Date.now() / 1000)
    ) {
      ShowInformationPopup(
        'Password Reset',
        'You have requested too many email changes. Please try later.'
      );
      return false;
    }

    return true;
  };

  const changeEmail = async () => {
    // Validations
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Send request
      const response = await fetchWrapper(`${backendUrl}/user/change-email`, {
        method: 'POST',
        body: JSON.stringify({ password: currentPassword, newEmail }),
      });

      // Show a popup with the response
      if (response.status === 200) {
        ShowInformationPopup(
          'Success',
          'Verification email sent to your new email address.'
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
    newEmail,
    isSubmitting,
    setCurrentPassword,
    setNewEmail,
    changeEmail,
  };
};
