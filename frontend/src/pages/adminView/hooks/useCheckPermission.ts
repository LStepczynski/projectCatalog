import { getUser } from '@utils/getUser';

import { UserObject } from '@type/user';

export const useCheckPermission = () => {
  const user: UserObject | undefined = getUser();

  if (!user) return (window.location.href = '/');

  if (user.Admin != 'true') {
    window.location.href = '/';
    return;
  }

  if (user.Verified != 'true') {
    alert(
      'Your account is not verified. Please verify your email to review articles.'
    );
    window.location.href = '/account';
    return;
  }
};
