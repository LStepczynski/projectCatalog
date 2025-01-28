import { ShowInformationPopup } from '@components/common/popups/informationPopup';
import { capitalize } from '@utils/capitalize';
import { fetchWrapper } from '@utils/fetchWrapper';

import { Link } from '@primer/react';

interface PasswordResetProps {
  username: string;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ username }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleClick = async () => {
    if (username.trim() === '') return;

    try {
      const response = await fetchWrapper(
        `${backendUrl}/user/forgot-password`,
        {
          method: 'POST',
          body: JSON.stringify({ username: username.trim() }),
        }
      );

      ShowInformationPopup('Forgot Password', response.response.message);
    } catch (err: any) {
      console.error('Password reset error:', err);
      ShowInformationPopup(
        'Forgot Password',
        capitalize(err.message || 'An error occurred') + '.'
      );
    }
  };

  return (
    <>
      <Link
        onClick={handleClick}
        sx={{ cursor: 'pointer', width: '40%', textAlign: 'center' }}
      >
        Forgot Password
      </Link>
    </>
  );
};
