import React from 'react';

import { Modal } from '@components/common/popups/Modal';

import { Box, TextInput, Button } from '@primer/react';
import { MoveToBottomIcon } from '@primer/octicons-react';

export const BannerUploadModal = ({ isOpen, closeFunc, bannerFunc }: any) => {
  const fileInputRef = React.useRef<any>(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  /**
   * Handles the file input change event.
   *
   * This function processes the selected file from the input event, performs validation checks,
   * and reads the file as a data URL if it is a valid image file.
   */
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const maxSize = 4 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size exceeds 4MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        bannerFunc([file, reader.result]);
      };
      reader.readAsDataURL(file);

      closeFunc();
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
    </Modal>
  );
};
