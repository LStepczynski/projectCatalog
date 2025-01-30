import { useState, FormEvent } from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';

interface FormData {
  username: string;
  password: string;
  email: string;
}

export const useFormSubmit = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
  });

  /**
   * Validates the form data.
   *
   * @returns {boolean} - Returns true if the form data is valid, otherwise false.
   */
  const validateForm = (): boolean => {
    const { username, password, email } = formData;

    if (
      username.trim() === '' ||
      password.trim() === '' ||
      email.trim() === ''
    ) {
      setErrorMessage('All fields must be filled.');
      return false;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }

    // Simple email regex for validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email address.');
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
      const response = await fetchWrapper(`${backendUrl}/auth/sign-up`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.status !== 'success') {
        setErrorMessage(response.message);
        return;
      }

      window.location.href = '/sign-in';
      setFormData({
        username: '',
        password: '',
        email: '',
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { errorMessage, loading, setFormData, formData, handleSubmit };
};
