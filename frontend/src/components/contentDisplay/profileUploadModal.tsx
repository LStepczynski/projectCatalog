import React from 'react';
import { Box, TextInput, Button } from '@primer/react';
import { Modal } from '../core/Modal';
import { MoveToBottomIcon } from '@primer/octicons-react';
import { ShowConfirmationPopup } from './confirmationPopup';
import { ShowInformationPopup } from './informationPopup';
import { getUser, fetchWrapper } from '@helper/helper';

export const ProfileUploadModal = ({ endpoint, isOpen, closeFunc }: any) => {
  const fileInputRef = React.useRef<any>(null);

  const user = getUser();

  const handleClick = () => {
    if (!fileInputRef.current) return;
    if (!user) return;
    const currentTime = Math.floor(Date.now() / 1000);
    const cooldown = 7 * 24 * 60 * 60;

    if (
      user.ProfilePicChange == 'null' ||
      currentTime - user.ProfilePicChange > cooldown
    ) {
      ShowConfirmationPopup(
        'Change profile picture',
        'Are you sure you want to change your profile picture? You can do that only once a week.',
        () => {},
        () => fileInputRef.current.click()
      );
    } else {
      ShowInformationPopup(
        'Profile picture timeout',
        'You have already changed your profile picture in the last week.'
      );
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        ShowInformationPopup('Error', 'Please select a valid image file.');
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        ShowInformationPopup('Error', 'File size exceeds 2MB.');
        return;
      }

      closeFunc();
      const result = await sendImage(file);
      if (result.status != 200) {
        ShowInformationPopup(
          'Error',
          `There was a problem with updating the profile picture. Try again later. Status code: ${result.status}`
        );
      }

      location.reload();
    }
  };

  const sendImage = async (file: any) => {
    const formData = new FormData();
    formData.append('image', file);

    return await fetchWrapper(endpoint, {
      method: 'POST',
      body: formData,
    });
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
    </Modal>
  );
};
