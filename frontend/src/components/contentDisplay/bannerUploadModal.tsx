import { Modal } from '../core/Modal';
import { Box, TextInput, Button } from '@primer/react';
import React from 'react';
import { MoveToBottomIcon } from '@primer/octicons-react';

export const BannerUploadModal = ({ isOpen, closeFunc, bannerFunc }: any) => {
  const fileInputRef = React.useRef<any>(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (event: any) => {
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
