import React, { useState } from 'react';
import { DeleteAccountButton } from './deleteAccountButton';
import { DeleteAccountModal } from './deleteAccountModal';

export const RemoveAccount: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <DeleteAccountButton onClick={openModal} />

      <DeleteAccountModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};
