import { getUser } from '@utils/getUser';

import { UserObject } from '@type/user';

export const useCheckPermission = () => {
  const user: UserObject | undefined = getUser();

  if (!user) return (window.location.href = '/');

  if (!user.roles.includes('admin')) {
    window.location.href = '/';
    return;
  }

  if (!user.roles.includes('verified')) {
    alert(
      'Your account is not verified. Please verify your email to review articles.'
    );
    window.location.href = '/account';
    return;
  }
};
