import sharp from 'sharp';

import { InternalError, UserError } from './statusError';

/**
 * Validates that the input is a Base64-encoded image of an allowed format.
 *
 * @param base64Image - The Base64 string of the image.
 * @returns {void}
 * @throws {UserError} - If the image is invalid or of an unsupported format.
 */
const validateImage = (base64Image: string): void => {
  // Check if the image is a base64 string
  const base64ImageRegex = /^data:image\/(png|jpeg|webp|heic);base64,/;
  if (!base64ImageRegex.test(base64Image)) {
    throw new UserError(
      'Invalid image format. The image must be a Base64-encoded PNG, JPEG, WEBP, or HEIC.',
      400
    );
  }

  // Check the mime type of the string
  const matchResult = base64Image.match(/^data:(image\/\w+);base64,/);
  if (!matchResult) {
    throw new UserError(
      'Invalid image format: Base64 string does not match expected pattern.',
      400
    );
  }
  const mimeType = matchResult[1];

  // Check if the mime type is allowed
  const allowedFormats = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/heic',
  ];

  if (!allowedFormats.includes(mimeType)) {
    throw new UserError(
      'Unsupported image format. Allowed formats are PNG, JPEG, WEBP, and HEIC.',
      400
    );
  }
};

export const resizeImage = async (
  base64Image: string,
  width: number,
  height: number
): Promise<Buffer> => {
  // Validate the image format and integrity
  validateImage(base64Image);

  try {
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const resizedImage = await sharp(imageBuffer)
      .resize({ width, height, fit: 'cover' })
      .webp()
      .toBuffer();

    return resizedImage;
  } catch (err) {
    throw new InternalError('Image processing failed', 500, [
      'sharp',
      'imageResize',
    ]);
  }
};
