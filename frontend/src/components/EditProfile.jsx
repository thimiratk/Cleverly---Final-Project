import React, { useState, useEffect, useRef } from 'react';
import { userProfileService } from '../services/userProfile.service';
import { useAuth } from '../context/AuthContext';
import './EditProfile.css';

const EditProfile = ({ onClose, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPictureFile, setCoverPictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [coverPicturePreview, setCoverPicturePreview] = useState(null);
  
  const profilePictureRef = useRef(null);
  const coverPictureRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    try {
      const profile = await userProfileService.getCurrentUserProfile();
      setFormData({
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || ''
      });
      setProfilePicturePreview(profile.profilePicture);
      setCoverPicturePreview(profile.coverPicture);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error fetching profile:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for profile picture');
        return;
      }
      
      setProfilePictureFile(file);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Cover picture must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for cover picture');
        return;
      }
      
      setCoverPictureFile(file);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update profile information
      const updatedProfile = await userProfileService.updateProfile(formData);

      // Upload profile picture if changed
      if (profilePictureFile) {
        try {
          await userProfileService.uploadProfilePicture(profilePictureFile);
        } catch (uploadError) {
          console.error('Profile picture upload error:', uploadError);
          setError('Failed to upload profile picture: ' + (uploadError.error || uploadError.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      }

      // Upload cover picture if changed
      if (coverPictureFile) {
        try {
          await userProfileService.uploadCoverPicture(coverPictureFile);
        } catch (uploadError) {
          console.error('Cover picture upload error:', uploadError);
          setError('Failed to upload cover picture: ' + (uploadError.error || uploadError.message || 'Unknown error'));
          setLoading(false);
          return;
        }
      }

      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile.profile);
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.error || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Cover Picture Section */}
          <div className="picture-section">
            <div className="cover-picture-container">
              <div 
                className="cover-picture-preview"
                style={{
                  backgroundImage: coverPicturePreview 
                    ? `url(${coverPicturePreview})` 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <button
                  type="button"
                  className="change-cover-btn"
                  onClick={() => coverPictureRef.current?.click()}
                >
                  <i className="fas fa-camera"></i>
                  Change Cover
                </button>
              </div>
              <input
                type="file"
                ref={coverPictureRef}
                onChange={handleCoverPictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* Profile Picture Section */}
            <div className="profile-picture-section">
              <div 
                className="profile-picture-preview"
                style={{
                  backgroundImage: profilePicturePreview 
                    ? `url(${profilePicturePreview})` 
                    : 'url(/api/placeholder/150/150)'
                }}
              >
                <button
                  type="button"
                  className="change-profile-btn"
                  onClick={() => profilePictureRef.current?.click()}
                >
                  <i className="fas fa-camera"></i>
                </button>
              </div>
              <input
                type="file"
                ref={profilePictureRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                maxLength="500"
              />
              <div className="character-count">
                {formData.bio.length}/500
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;