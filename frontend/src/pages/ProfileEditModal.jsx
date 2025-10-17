import React, { useState, useEffect } from 'react';
import { X, Camera, User, Image } from 'lucide-react';
import { 
  Button, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  COMMON_STYLES
} from '../components/ui/UIComponents';
import { userProfileService } from '../services/userProfile.service';

const ProfileEditModal = ({ isOpen, onClose, user, onSave, onImageUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: user?.bio || '',
    profileImage: user?.profilePicture || null,
    coverImage: user?.coverPicture || null
  });

  // Update profileData when user prop changes
  useEffect(() => {
    if (user) {
      setProfileData({
        bio: user.bio || '',
        profileImage: user.profilePicture || null,
        coverImage: user.coverPicture || null
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e, imageType = 'profile') => {
    const file = e.target.files[0];
    if (file) {
      try {
        setImageUploading(true);
        console.log(`Uploading ${imageType} image:`, file.name);
        
        // Upload image to backend
        let response;
        if (imageType === 'cover') {
          response = await userProfileService.uploadCoverPicture(file);
          console.log('Cover picture upload response:', response);
          
          if (response.coverPicture) {
            setProfileData(prev => {
              const newData = { 
                ...prev, 
                coverImage: response.coverPicture 
              };
              console.log('Updated profile data with cover:', newData);
              return newData;
            });
            
            // Immediately notify parent component about the cover image update
            if (onImageUpdate) {
              onImageUpdate('cover', response.coverPicture);
            }
            
            // Show success message
            alert('Cover picture updated successfully!');
          }
        } else {
          response = await userProfileService.uploadProfilePicture(file);
          console.log('Profile picture upload response:', response);
          
          if (response.profilePicture) {
            setProfileData(prev => {
              const newData = { 
                ...prev, 
                profileImage: response.profilePicture 
              };
              console.log('Updated profile data with profile image:', newData);
              return newData;
            });
            
            // Immediately notify parent component about the profile image update
            if (onImageUpdate) {
              onImageUpdate('profile', response.profilePicture);
            }
            
            // Show success message
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Show more specific error message
        const errorMessage = error.response?.data?.error || error.message || `Failed to upload ${imageType} image`;
        alert(`Upload failed: ${errorMessage}`);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      console.log('Saving profile data:', profileData);
      
      // Only send bio for profile update
      // Images are already uploaded via separate endpoints
      const profileUpdateData = {
        bio: profileData.bio
      };
      
      // Check if there are any changes to save
      const hasChanges = profileUpdateData.bio !== user?.bio;
      
      if (hasChanges) {
        const response = await userProfileService.updateProfile(profileUpdateData);
        
        console.log('Profile update response:', response);
        
        // Extract the profile from the response (it might be nested)
        const updatedProfile = response.profile || response;
        
        console.log('Updated profile being passed to parent:', updatedProfile);
        
        // Call the parent's save handler
        onSave({
          profile: updatedProfile
        });
        
        alert('Profile updated successfully!');
      } else {
        // No changes to save, just close the modal
        console.log('No profile changes to save');
      }
      
      // Close modal after save
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save profile';
      alert(`Failed to save profile: ${errorMessage}`);
      
      // Don't close modal on error, let user try again
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={COMMON_STYLES.modalOverlay}>
      <div className={COMMON_STYLES.modalContent}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-300 to-purple-300 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-500 hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              <X size={25} />
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-1">
            <Button
              variant='secondary'
              size="sm"
              className='bg-white text-blue-600'
            >
              Profile Details
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="pt-2 pl-5 pr-5 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
              {/* Cover Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                <div className="relative">
                  <div className="w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                    {profileData.coverImage ? (
                      <img 
                        src={profileData.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Image size={32} className="mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload cover image</p>
                          <p className="text-xs opacity-80">Recommended: 1200x400px</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <label htmlFor="cover-image" className={`absolute bottom-3 right-3 rounded-full p-3 cursor-pointer transition-colors shadow-lg ${
                    imageUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}>
                    {imageUploading ? (
                      <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={18} />
                    )}
                  </label>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    disabled={imageUploading}
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    {!profileData.profileImage && (
                      <User size={48} className="absolute inset-0 m-auto text-gray-400" />
                    )}
                    <AvatarImage src={profileData.profileImage} alt="" />
                  </Avatar>
                  <label htmlFor="profile-image" className={`absolute -bottom-2 -right-2 rounded-full p-2 cursor-pointer transition-colors shadow-lg ${
                    imageUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}>
                    {imageUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={16} />
                    )}
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    disabled={imageUploading}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Profile Picture</p>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">{profileData.bio.length}/200 characters</p>
              </div>
            </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || imageUploading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? 'Saving...' : imageUploading ? 'Image uploading...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;