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
      // Validate that the file is an image
      if (!file.type.startsWith('image/')) {
        ShowInformationPopup('Error', 'Please select a valid image file.');
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        ShowInformationPopup('Error', 'File size exceeds 2MB.');
        return;
      }

      // Convert the file to a Base64 string
      const base64String = await convertToBase64(file);

      // Close the modal or any related UI
      closeFunc();

      // Send the Base64 string to the server
      const result = await sendImage(base64String);

      // Handle response
      if (result.status != 200) {
        ShowInformationPopup(
          'Error',
          `There was a problem with updating the profile picture. Try again later. Status code: ${result.status}`
        );
      }

      // Reload the page to reflect changes
      location.reload();
    }
  };

  // Helper function to convert file to Base64
  const convertToBase64 = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Reads the file as a Data URL (Base64 encoded)
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to send the Base64 image string
  const sendImage = async (base64String: string) => {
    return await fetchWrapper(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        image: base64String, // Send the Base64 string
      }),
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
