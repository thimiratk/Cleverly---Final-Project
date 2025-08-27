import { useRef } from 'react';
import { Camera } from 'lucide-react';

const ImageUpload = ({ currentImage, onImageChange, className = "" }) => {
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result); // directly update profile image
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img 
        src={currentImage} 
        alt="Profile" 
        className="w-32 h-32 rounded-full border-4 border-white object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleCameraClick}
      />
      <button 
        onClick={handleCameraClick}
        className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 shadow-lg transition-colors"
      >
        <Camera className="w-4 h-4 text-orange-500" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
