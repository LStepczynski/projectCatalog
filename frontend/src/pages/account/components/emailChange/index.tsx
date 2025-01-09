import React from 'react';

import { ChangeEmailModal } from './changeEmailModal';

import { Button } from '@primer/react';

export const EmailChange = () => {
  const [open, setOpen] = React.useState(false);

  const closeModal = () => setOpen(false);
  const openModal = () => setOpen(true);

  return (
    <>
      <Button onClick={openModal}>Change Email</Button>

      <ChangeEmailModal isOpen={open} onClose={closeModal} />
    </>
  );
};
