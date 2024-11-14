import React from 'react';

import { ChangePasswordModal } from './passwordChangeModal';

import { Button } from '@primer/react';

export const PasswordChange = () => {
  const [open, setOpen] = React.useState(false);

  const closeModal = () => setOpen(false);
  const openModal = () => setOpen(true);

  return (
    <>
      <Button onClick={openModal}>Change Password</Button>

      <ChangePasswordModal isOpen={open} onClose={closeModal} />
    </>
  );
};
