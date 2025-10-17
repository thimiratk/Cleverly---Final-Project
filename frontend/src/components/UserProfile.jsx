import React, { useState, useEffect, useRef } from 'react';
import { userProfileService } from '../services/userProfile.service';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = ({ userId, isOwnProfile = false, onEditClick }) => {
  const [profile, setProfile] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [badges, setBadges] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [showFollowMenu, setShowFollowMenu] = useState(false);
  const { user } = useAuth();
  const followMenuRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!showFollowMenu) return;

    const handleClickOutside = (event) => {
      if (followMenuRef.current && !followMenuRef.current.contains(event.target)) {
        setShowFollowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFollowMenu]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const profilePromise = isOwnProfile 
        ? userProfileService.getCurrentUserProfile()
        : userProfileService.getUserProfile(userId);

      // Fetch follow stats, badges, and trust score
      const followStatsPromise = userProfileService.getFollowStats(userId);
      const badgesPromise = userProfileService.getUserBadges(userId);
      
      // Fetch trust score with fallback
      const trustScorePromise = userProfileService.getUserTrustScore(userId).catch(err => {
        console.warn('Trust score fetch failed, using fallback:', err);
        return null;
      });

      const [profileData, followStatsData, badgesData, trustScoreData] = await Promise.all([
        profilePromise,
        followStatsPromise,
        badgesPromise,
        trustScorePromise
      ]);

      console.log('=== User Profile Data Debug ===');
      console.log('Profile Data:', profileData);
      console.log('Profile Trust Score:', profileData?.trustScore);
      console.log('Badges Data:', badgesData);
      console.log('Badges Trust Score:', badgesData?.trustScore);
      console.log('Trust Score Data:', trustScoreData);
      console.log('Trust Score Value:', trustScoreData?.trustScore);
      console.log('=============================');

      setProfile(profileData);
      setFollowStats(followStatsData);
      setBadges(badgesData);
      setTrustScore(trustScoreData);
      const resolvedFollowing = typeof followStatsData?.isFollowing === 'boolean'
        ? followStatsData.isFollowing
        : Boolean(profileData?.isFollowing);
      setFollowing(resolvedFollowing);
      setShowFollowMenu(false);
    } catch (err) {
      setError(err.error || 'Failed to load profile data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAction = async (action) => {
    try {
      const normalizedUserId = userId?.toString ? userId.toString() : userId;

      if (action === 'follow') {
        await userProfileService.followUser(userId);
        setFollowing(true);
        let nextFollowersCount = 1;
        setFollowStats((prev) => {
          if (!prev) {
            return {
              followersCount: 1,
              followingCount: 0,
              isFollowing: true
            };
          }
          nextFollowersCount = (prev.followersCount || 0) + 1;
          return {
            ...prev,
            followersCount: nextFollowersCount,
            isFollowing: true
          };
        });
        window.dispatchEvent(
          new CustomEvent('followStatusChanged', {
            detail: {
              userId: normalizedUserId,
              isFollowing: true,
              followersCount: nextFollowersCount,
              followerId: user?.id,
              followerFollowingCount: null,
              action: 'follow'
            }
          })
        );
      }

      if (action === 'unfollow') {
        await userProfileService.unfollowUser(userId);
        setFollowing(false);
        let nextFollowersCount = 0;
        setFollowStats((prev) => {
          if (!prev) {
            return {
              followersCount: 0,
              followingCount: 0,
              isFollowing: false
            };
          }
          nextFollowersCount = Math.max(0, (prev.followersCount || 0) - 1);
          return {
            ...prev,
            followersCount: nextFollowersCount,
            isFollowing: false
          };
        });
        window.dispatchEvent(
          new CustomEvent('followStatusChanged', {
            detail: {
              userId: normalizedUserId,
              isFollowing: false,
              followersCount: nextFollowersCount,
              followerId: user?.id,
              followerFollowingCount: null,
              action: 'unfollow'
            }
          })
        );
      }

      setShowFollowMenu(false);
    } catch (err) {
      console.error('Error following/unfollowing user:', err);
      const message = err?.error || err?.message || err?.response?.data?.error || 'Failed to update follow status';
      alert(message);
    }
  };

  useEffect(() => {
    const handleFollowStatusChange = (event) => {
      const { detail } = event;
      if (!detail) return;
      const normalizedUserId = userId?.toString ? userId.toString() : userId;
      if (!normalizedUserId) return;

      if (detail.userId?.toString && detail.userId.toString() === normalizedUserId.toString()) {
        setFollowing(Boolean(detail.isFollowing));
        setFollowStats((prev) => {
          if (!prev) {
            return {
              followersCount: typeof detail.followersCount === 'number' ? detail.followersCount : 0,
              followingCount: 0,
              isFollowing: Boolean(detail.isFollowing)
            };
          }
          return {
            ...prev,
            isFollowing: Boolean(detail.isFollowing),
            followersCount: typeof detail.followersCount === 'number'
              ? detail.followersCount
              : prev.followersCount
          };
        });
        setShowFollowMenu(false);
      }
    };

    window.addEventListener('followStatusChanged', handleFollowStatusChange);
    return () => {
      window.removeEventListener('followStatusChanged', handleFollowStatusChange);
    };
  }, [userId]);

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
              <span className="stat-number">{trustScore?.trustScore || profile?.trustScore || badges?.trustScore || 0}</span>
              <span className="stat-label">Trust Score</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isOwnProfile && user && userId !== user.id && (
              following ? (
                <div className="follow-btn-group" ref={followMenuRef}>
                  <button
                    type="button"
                    className="follow-btn following"
                    onClick={() => setShowFollowMenu((prev) => !prev)}
                    aria-expanded={showFollowMenu}
                    aria-haspopup="true"
                  >
                    Following <span className="caret">▾</span>
                  </button>
                  {showFollowMenu && (
                    <div className="follow-dropdown">
                      <button type="button" onClick={() => handleFollowAction('unfollow')}>
                        Unfollow
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleFollowAction('follow')}
                  className="follow-btn not-following"
                >
                  Follow
                </button>
              )
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
              <span className="trust-score-number">{trustScore?.trustScore || profile?.trustScore || badges?.trustScore || 0}</span>
              <span className="trust-score-max">/100</span>
            </div>
            <div className="trust-score-info">
              <p>Trust score is based on verified reviews, community feedback, and account activity.</p>
              {trustScore?.breakdown && trustScore.breakdown.totalReviews > 0 ? (
                <div className="trust-score-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Total Reviews:</span>
                    <span className="breakdown-value">{trustScore.breakdown.totalReviews}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Verified Reviews:</span>
                    <span className="breakdown-value">{trustScore.breakdown.verifiedReviews}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Community Agrees:</span>
                    <span className="breakdown-value">{trustScore.breakdown.totalAgreeCount}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Agreement Rate:</span>
                    <span className="breakdown-value">{trustScore.breakdown.averageAgreePercentage?.toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <div className="trust-score-message">
                  <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
                    No reviews yet. Write reviews to start building your trust score!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;