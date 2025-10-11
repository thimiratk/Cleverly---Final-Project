import React, { useState, useEffect } from 'react';
import { userProfileService } from '../services/userProfile.service';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = ({ userId, isOwnProfile = false, onEditClick }) => {
  const [profile, setProfile] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const profilePromise = isOwnProfile 
        ? userProfileService.getCurrentUserProfile()
        : userProfileService.getUserProfile(userId);

      // Fetch follow stats and badges
      const followStatsPromise = userProfileService.getFollowStats(userId);
      const badgesPromise = userProfileService.getUserBadges(userId);

      const [profileData, followStatsData, badgesData] = await Promise.all([
        profilePromise,
        followStatsPromise,
        badgesPromise
      ]);

      setProfile(profileData);
      setFollowStats(followStatsData);
      setBadges(badgesData);
      setFollowing(followStatsData.isFollowing || false);
    } catch (err) {
      setError(err.error || 'Failed to load profile data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await userProfileService.unfollowUser(userId);
        setFollowing(false);
        setFollowStats(prev => ({
          ...prev,
          followersCount: prev.followersCount - 1,
          isFollowing: false
        }));
      } else {
        await userProfileService.followUser(userId);
        setFollowing(true);
        setFollowStats(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1,
          isFollowing: true
        }));
      }
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      alert(err.error || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>Error: {error}</p>
        <button onClick={fetchUserData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Cover Photo */}
      <div className="cover-photo-container">
        <img
          src={profile.coverPicture || '/api/placeholder/1200/400'}
          alt="Cover"
          className="cover-photo"
        />
        {isOwnProfile && (
          <button className="edit-cover-btn">
            <i className="fas fa-camera"></i>
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-picture-container">
          <img
            src={profile.profilePicture || '/api/placeholder/150/150'}
            alt={profile.username}
            className="profile-picture"
          />
          {isOwnProfile && (
            <button className="edit-profile-pic-btn">
              <i className="fas fa-camera"></i>
            </button>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">
              {profile.firstName && profile.lastName 
                ? `${profile.firstName} ${profile.lastName}`
                : profile.username
              }
            </h1>
            <p className="profile-username">@{profile.username}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{followStats?.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{followStats?.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{badges?.trustScore || 0}</span>
              <span className="stat-label">Trust Score</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isOwnProfile && user && userId !== user.id && (
              <button
                onClick={handleFollow}
                className={`follow-btn ${following ? 'following' : 'not-following'}`}
              >
                {following ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {isOwnProfile && (
              <button className="edit-profile-btn" onClick={onEditClick}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Bio Section */}
        {profile.bio && (
          <div className="bio-section">
            <h3>About</h3>
            <p className="bio-text">{profile.bio}</p>
          </div>
        )}

        {/* Badges Section */}
        {badges?.badges && badges.badges.length > 0 && (
          <div className="badges-section">
            <h3>Badges</h3>
            <div className="badges-grid">
              {badges.badges.map((badge) => (
                <div key={badge.id} className="badge-item">
                  <img src={badge.iconUrl} alt={badge.name} className="badge-icon" />
                  <div className="badge-info">
                    <h4 className="badge-name">{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    <p className="badge-date">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trust Score Details */}
        <div className="trust-score-section">
          <h3>Trust Score</h3>
          <div className="trust-score-display">
            <div className="trust-score-circle">
              <span className="trust-score-number">{badges?.trustScore || 0}</span>
            </div>
            <div className="trust-score-info">
              <p>Trust score is based on verified reviews, community feedback, and account activity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;