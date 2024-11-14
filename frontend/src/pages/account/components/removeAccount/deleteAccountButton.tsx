import React from 'react';
import { Button } from '@primer/react';

interface DeleteAccountButtonProps {
  onClick: () => void;
}

export const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({
  onClick,
}) => {
  return (
    <Button variant="danger" sx={{ fontSize: '16px', p: 3 }} onClick={onClick}>
      Delete Account
    </Button>
  );
};
