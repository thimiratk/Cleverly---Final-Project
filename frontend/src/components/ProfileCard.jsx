import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileCard.css';

const ProfileCard = ({ 
  userId, 
  username, 
  firstName, 
  lastName, 
  profilePicture, 
  trustScore, 
  followersCount,
  isFollowing,
  size = 'medium' // small, medium, large
}) => {
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : username;

  return (
    <Link to={`/user-profile/${userId}`} className={`profile-card ${size}`}>
      <div className="profile-card-content">
        <div className="profile-card-avatar">
          <img
            src={profilePicture || '/api/placeholder/60/60'}
            alt={username}
            className="avatar-image"
          />
          {trustScore && (
            <div className="trust-badge">
              {trustScore}
            </div>
          )}
        </div>
        
        <div className="profile-card-info">
          <h4 className="profile-card-name">{displayName}</h4>
          <p className="profile-card-username">@{username}</p>
          
          {followersCount !== undefined && (
            <div className="profile-card-stats">
              <span className="followers-count">
                {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
              </span>
            </div>
          )}
        </div>

        {isFollowing !== undefined && (
          <div className="follow-indicator">
            {isFollowing ? (
              <span className="following-badge">Following</span>
            ) : (
              <span className="not-following-badge">Follow</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProfileCard;