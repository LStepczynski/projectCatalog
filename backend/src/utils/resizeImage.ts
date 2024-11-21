import sharp from 'sharp';

import { UserError } from './statusError';

/**
 * Tests if a Base64 string is of an allowed image format.
 * 
 * @param image - The Base64 string of the image.
 * @returns {boolean} - True if the string is a valid base64 image.
 */
const isBase64Image = (image: string): boolean => {
  if (!/^data:image\/\w+;base64,/.test(image)) {
    return false
  }
  return true;
}

/**
 * Tests if a Base64 string is of an allowed image format.
 * 
 * @param base64Image - The Base64 string of the image.
 * @returns {boolean} - True if the image is one of the allowed formats.
 */
export const isAllowedImageFormat = (base64Image: string): boolean => {
  // Define allowed formats
  const allowedFormats = ['image/png', 'image/jpeg', 'image/webp', 'image/heic'];

  // Extract the MIME type from the Base64 header
  const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);

  if (!mimeMatch) {
    throw new UserError('Image submission failed', 500);
  }

  const mimeType = mimeMatch[1];

  // Check if the MIME type is in the allowed formats
  return allowedFormats.includes(mimeType);
};


export const resizeImage = async (base64Image: string, width: number, height: number) => {
  // Remove metadata from the image
  if (!isBase64Image(base64Image)) {
    throw new UserError('Image submission failed', 500)
  }

  if (!isAllowedImageFormat(base64Image)) {
    throw new UserError('Image submission failed. Unsupported image type', 400)
  }

  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

  // Load the string into the buffer
  const imageBuffer = Buffer.from(base64Data, 'base64');

  const resizedImage = await sharp(imageBuffer)
    .resize({ width: width, height: height, fit: 'cover' })
    .webp()
    .toBuffer()

  return resizedImage
}