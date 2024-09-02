import React from 'react';
import { Box, TextInput, Button } from '@primer/react';
import { Modal } from '../core/Modal';
import { MoveToBottomIcon } from '@primer/octicons-react';
import { ConfirmationPopup } from './confirmationPopup';

export const ProfileUploadModal = ({ endpoint, isOpen, closeFunc }: any) => {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const fileInputRef = React.useRef<any>(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    setIsPopupOpen(true);
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds 2MB.');
        return;
      }

      closeFunc();
      const result = await sendImage(file);
      if (result.status != 200) {
        return alert(
          `There was a problem with updating the profile picture. Try again later. Status code: ${result.status}`
        );
      }
      localStorage.setItem(
        'verificationToken',
        result.response.verificationToken
      );

      alert('New profile picture uploaded. Refresh the page to see changes.');
    }
  };

  const sendImage = async (file: any) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${
            localStorage.getItem('verificationToken') || ''
          }`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} closeFunc={closeFunc}>
      <TextInput
        ref={fileInputRef}
        sx={{ display: 'none' }}
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        multiple={false}
      />
      <Button
        sx={{
          width: '180px',
          height: '180px',
        }}
        onClick={handleClick}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <MoveToBottomIcon size={60} />
          Upload Picture
        </Box>
      </Button>
      <ConfirmationPopup
        title="Change profile picture"
        description="Are you sure you want to change your profile picture? You can do that only once a week."
        onDecline={() => setIsPopupOpen(false)}
        onAccept={() => fileInputRef.current.click()}
        isOpen={isPopupOpen}
      />
    </Modal>
  );
};
