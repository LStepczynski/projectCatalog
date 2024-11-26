// __tests__/utils/imageUtils.test.ts
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { resizeImage } from '@utils/resizeImage';
import sharp, { Sharp } from 'sharp';
import { InternalError, UserError } from '@utils/statusError';

// Mock the 'sharp' module
vi.mock('sharp');

// Type the mocked sharp function
const mockedSharp = sharp as unknown as MockedFunction<typeof sharp>;

describe('resizeImage', () => {
  beforeEach(() => {
    mockedSharp.mockClear();
  });

  it('should resize a valid Base64 image and return a Buffer', async () => {
    // Arrange
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const width = 800;
    const height = 600;
    const mockBuffer = Buffer.from('mockedBuffer');

    // Create individual mocks
    const mockResize = vi.fn().mockReturnThis();
    const mockWebp = vi.fn().mockReturnThis();
    const mockToBuffer = vi.fn().mockResolvedValue(mockBuffer);

    // Setup the mock implementation for 'sharp'
    mockedSharp.mockImplementation(
      (): Sharp =>
        ({
          resize: mockResize,
          webp: mockWebp,
          toBuffer: mockToBuffer,
        } as Partial<Sharp> as Sharp)
    );

    // Act
    const result = await resizeImage(base64Image, width, height);

    // Assert
    expect(mockedSharp).toHaveBeenCalledWith(
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAUA', 'base64')
    );
    expect(mockResize).toHaveBeenCalledWith({ width, height, fit: 'cover' });
    expect(mockWebp).toHaveBeenCalled();
    expect(mockToBuffer).toHaveBeenCalled();
    expect(result).toBe(mockBuffer);
  });

  it('should throw UserError if Base64 string is invalid', async () => {
    // Arrange
    const invalidBase64Image = 'invalidBase64String';
    const width = 800;
    const height = 600;

    // Act & Assert
    await expect(
      resizeImage(invalidBase64Image, width, height)
    ).rejects.toThrow(UserError);
    await expect(
      resizeImage(invalidBase64Image, width, height)
    ).rejects.toMatchObject({
      message: 'Image submission failed',
      status: 500,
    });
  });

  it('should throw UserError if image format is not allowed', async () => {
    // Arrange
    const disallowedFormatImage =
      'data:image/gif;base64,R0lGODlhPQBEAPeoAJosM//AwO/AwHV';
    const width = 800;
    const height = 600;

    // Act & Assert
    await expect(
      resizeImage(disallowedFormatImage, width, height)
    ).rejects.toThrow(UserError);
    await expect(
      resizeImage(disallowedFormatImage, width, height)
    ).rejects.toMatchObject({
      message: 'Image submission failed. Unsupported image type',
      status: 400,
    });
  });

  it('should throw UserError if sharp processing fails', async () => {
    // Arrange
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const width = 800;
    const height = 600;
    const mockError = new Error('Sharp processing error');

    // Create mock implementations for the chainable methods
    const mockResize = vi.fn().mockReturnThis();
    const mockWebp = vi.fn().mockReturnThis();
    const mockToBuffer = vi.fn().mockRejectedValue(mockError);

    // Setup the mock implementation for 'sharp'
    mockedSharp.mockImplementation(
      (): Sharp =>
        ({
          resize: mockResize,
          webp: mockWebp,
          toBuffer: mockToBuffer,
        } as Partial<Sharp> as Sharp)
    );

    // Act & Assert
    await expect(resizeImage(base64Image, width, height)).rejects.toThrow(
      InternalError
    );
    await expect(resizeImage(base64Image, width, height)).rejects.toMatchObject(
      {
        message: 'Image processing failed',
        status: 500,
        details: ['sharp', 'imageResize'],
      }
    );
  });
});
