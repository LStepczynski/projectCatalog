import { useState, FormEvent } from 'react';

import { capitalize } from '@utils/capitalize';
import { fetchWrapper } from '@utils/fetchWrapper';

interface FormData {
  username: string;
  password: string;
}

export const useFormSubmit = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  /**
   * Validates the form data.
   *
   * @returns {boolean} - Returns true if the form data is valid, otherwise false.
   */
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

  /**
   * Handles the form submission event.
   *
   * @param {FormEvent} event - The form submission event.
   * @returns {Promise<void>} A promise that resolves when the form submission is complete.
   *
   * This function prevents the default form submission behavior, validates the form,
   * sets the loading state, and attempts to submit the form data to the backend.
   * If the response status is not 200, it sets an error message. If an error occurs
   * during the fetch operation, it logs the error and sets an error message.
   * Finally, it resets the loading state.
   */
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

  return { errorMessage, loading, setFormData, formData, handleSubmit };
};
