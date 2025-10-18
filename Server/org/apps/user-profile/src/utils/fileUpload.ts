import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';

// Configure Cloudinary - Using environment variables from main .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drltde5us', // Default to match frontend
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fieldSize: 10 * 1024 * 1024, // 10MB field limit
    fields: 10,
    files: 1
  },
});

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string, userId?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' }
      ],
    };

    // Use consistent public_id based on userId to replace existing image
    if (userId) {
      uploadOptions.public_id = `${folder}/${userId}_profile`;
      uploadOptions.overwrite = true; // Replace existing image
      uploadOptions.invalidate = true; // Clear CDN cache
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(fileBuffer);
  });
};

export const uploadCoverToCloudinary = async (fileBuffer: Buffer, folder: string, userId?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 400, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' }
      ],
    };

    // Use consistent public_id based on userId to replace existing image
    if (userId) {
      uploadOptions.public_id = `${folder}/${userId}_cover`;
      uploadOptions.overwrite = true; // Replace existing image
      uploadOptions.invalidate = true; // Clear CDN cache
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    ).end(fileBuffer);
  });
};