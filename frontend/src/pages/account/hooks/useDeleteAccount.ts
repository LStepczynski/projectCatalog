import React from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { logOut } from '@utils/logOut';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

export const useDeleteAccount = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDeleteAccount = async (
    password: string,
    backendUrl: string,
    closeModal: () => void
  ) => {
    if (!password) {
      ShowInformationPopup(
        'Error',
        'Password is required to delete your account.'
      );
      return;
    }

    const confirmDeletion = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmDeletion) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchWrapper(
        `${backendUrl}/users/delete-account`,
        {
          method: 'DELETE',
          body: JSON.stringify({ password }),
        }
      );

      if (response.status === 'success') {
        ShowInformationPopup(
          'Success',
          'Your account has been successfully deleted.',
          logOut
        );
        closeModal();
      } else {
        ShowInformationPopup('Error', capitalize(response.message));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      ShowInformationPopup(
        'Error',
        'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleDeleteAccount };
};
