// Upload file to Cloudinary (browser-safe version)
export const uploadToCloudinary = async (file, type = 'image') => {
  console.log('Starting Cloudinary upload for:', file.name, 'Type:', type);
  console.log('Cloud name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
  console.log('Upload preset:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const resourceType = type === 'video' ? 'video' : 'image';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  
  console.log('Upload URL:', uploadUrl);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Cloudinary response status:', response.status);
    console.log('Cloudinary response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleToCloudinary = async (files, type = 'image') => {
  if (!files || files.length === 0) return [];
  
  console.log(`Starting upload of ${files.length} files of type: ${type}`);
  
  try {
    const uploadPromises = files.map((file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}:`, file.name);
      return uploadToCloudinary(file, type);
    });
    
    const results = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${results.length} files`);
    return results;
  } catch (error) {
    console.error('Failed to upload multiple files:', error);
    throw new Error(`Media upload failed: ${error.message}. Please check your internet connection and try again.`);
  }
};

// Test function to validate Cloudinary configuration
export const testCloudinaryConfig = async () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  console.log('Testing Cloudinary configuration...');
  console.log('Cloud name:', cloudName);
  console.log('Upload preset:', uploadPreset);
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please check environment variables.');
  }
  
  // Test with a tiny base64 image
  const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFAxlXn9gAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: new URLSearchParams({
        file: testImageData,
        upload_preset: uploadPreset
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary test failed:', errorText);
      throw new Error(`Configuration test failed: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Cloudinary test successful:', result.secure_url);
    return true;
  } catch (error) {
    console.error('Cloudinary test error:', error);
    throw error;
  }
};
