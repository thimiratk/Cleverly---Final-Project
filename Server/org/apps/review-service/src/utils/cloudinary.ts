import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Ensure Cloudinary is configured using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const splitUrl = new URL(url);
    const pathname = splitUrl.pathname; // e.g. /<resource>/upload/v1234/folder/name.jpg
    const segments = pathname.split('/');

    const uploadIndex = segments.findIndex((part) => part === 'upload' || part === 'image' || part === 'video');
    if (uploadIndex === -1) {
      return null;
    }

    const publicIdSegments = segments.slice(uploadIndex + 1);
    if (!publicIdSegments.length) {
      return null;
    }

    const lastSegment = publicIdSegments[publicIdSegments.length - 1];
    const withoutExtension = lastSegment.includes('.')
      ? lastSegment.substring(0, lastSegment.lastIndexOf('.'))
      : lastSegment;
    publicIdSegments[publicIdSegments.length - 1] = withoutExtension;

    return publicIdSegments.join('/');
  } catch (error) {
    console.error('Failed to extract Cloudinary public ID from URL:', url, error);
    return null;
  }
};

const resolveResourceType = (url: string): 'image' | 'video' => {
  if (url.includes('/video/')) {
    return 'video';
  }
  return 'image';
};

export const deleteAssetByUrl = async (url: string): Promise<UploadApiResponse | null> => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) {
    return null;
  }

  const resourceType = resolveResourceType(url);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result as UploadApiResponse;
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', publicId, error);
    return null;
  }
};

export const deleteAssetsByUrls = async (urls: string[]): Promise<void> => {
  if (!urls || urls.length === 0) {
    return;
  }

  const uniqueUrls = Array.from(new Set(urls));
  await Promise.all(
    uniqueUrls.map(async (url) => {
      await deleteAssetByUrl(url);
    })
  );
};
