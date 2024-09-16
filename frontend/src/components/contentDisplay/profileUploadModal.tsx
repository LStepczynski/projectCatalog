import React from 'react';
import { Box, TextInput, Button } from '@primer/react';
import { Modal } from '../core/Modal';
import { MoveToBottomIcon } from '@primer/octicons-react';
import { ConfirmationPopup } from './confirmationPopup';
import { InformationPopup } from './informationPopup';
import { getUser, fetchWrapper } from '@helper/helper';

export const ProfileUploadModal = ({ endpoint, isOpen, closeFunc }: any) => {
  const [confirmationPopupState, setConfirmationPopupState] =
    React.useState(false);
  const [informationPopupState, setInformationPopupState] =
    React.useState(false);
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
      setConfirmationPopupState(true);
    } else {
      setInformationPopupState(true);
    }
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
      <ConfirmationPopup
        title="Change profile picture"
        description="Are you sure you want to change your profile picture? You can do that only once a week."
        onDecline={() => setConfirmationPopupState(false)}
        onAccept={() => fileInputRef.current.click()}
        isOpen={confirmationPopupState}
      />
      <InformationPopup
        title="Profile picture timeout"
        description="You have already changed your profile picture in the last week."
        closeFunc={() => setInformationPopupState(false)}
        isOpen={informationPopupState}
      />
    </Modal>
  );
};
