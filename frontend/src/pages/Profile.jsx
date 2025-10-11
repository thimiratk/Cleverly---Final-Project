import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Star,
  UserPlus,
  UserMinus,
  MessageCircle,
  Settings,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
} from "../components/ui/UIComponents";
import ProfileEditModal from "./ProfileEditModal";
import ReviewCard from "../components/ReviewCard";
import { userProfileService } from "../services/userProfile.service";
import { reviewService } from "../services/review.service";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?.id;

  const [userData, setUserData] = useState({
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    bio: "",
    profilePicture: "",
    coverPicture: "",
    trustScore: 0,
    followersCount: 0,
    followingCount: 0,
    badges: [],
    isFollowing: false,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Profile component - userId from params:', userId);
        console.log('Profile component - currentUser:', currentUser);
        console.log('Profile component - isOwnProfile:', isOwnProfile);

        const profileData = isOwnProfile
          ? await userProfileService.getCurrentUserProfile()
          : await userProfileService.getUserProfile(userId);

        console.log('Profile component - fetched profileData:', profileData);
        console.log('Profile component - createdAt from backend:', profileData.createdAt);
        console.log('Profile component - name:', profileData.name);
        console.log('Profile component - firstName:', profileData.firstName);
        console.log('Profile component - lastName:', profileData.lastName);
        console.log('Profile component - username:', profileData.username);

        const mappedUserData = {
          id: profileData.id,
          username: profileData.username,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          displayName:
            profileData.firstName && profileData.lastName
              ? `${profileData.firstName} ${profileData.lastName}`
              : profileData.firstName ||
                profileData.lastName ||
                profileData.name ||
                profileData.username ||
                "Anonymous User",
          email: profileData.email,
          bio: profileData.bio || "",
          profilePicture: profileData.profilePicture || "",
          coverPicture: profileData.coverPicture || "",
          trustScore: profileData.trustScore || 0,
          followersCount: profileData.followersCount || 0,
          followingCount: profileData.followingCount || 0,
          badges: profileData.badges || [],
          isFollowing: profileData.isFollowing || false,
          createdAt: profileData.createdAt,
        };

        console.log('Profile component - mapped userData:', mappedUserData);
        console.log('Profile component - final displayName:', mappedUserData.displayName);
        setUserData(mappedUserData);
        await fetchUserReviews(profileData.id);
      } catch (err) {
        console.error('Profile component - error:', err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchProfileData();
  }, [userId, currentUser, isOwnProfile]);

  const fetchUserReviews = async (profileUserId) => {
    try {
      setReviewsLoading(true);
      console.log('Fetching reviews for user ID:', profileUserId);
      
      // Use the profile user's ID to filter reviews
      const reviews = await reviewService.getUserReviews(profileUserId);
      console.log('Fetched reviews:', reviews);
      
      setUserReviews(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setUserReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (userData.isFollowing) {
        await userProfileService.unfollowUser(userId);
        setUserData((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: prev.followersCount - 1,
        }));
      } else {
        await userProfileService.followUser(userId);
        setUserData((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProfile = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  // Format the join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long' };
      return `Joined ${date.toLocaleDateString('en-US', options)}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-12">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
        {/* --- Cover Section --- */}
        <div className="relative h-60 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-b-3xl overflow-hidden shadow-md">
          {userData.coverPicture && (
            <img
              src={userData.coverPicture}
              alt="Cover"
              className="w-full h-full object-cover opacity-80"
            />
          )}
        </div>

        {/* --- Profile Card --- */}
        <Card className="relative -mt-20 mx-4 sm:mx-0 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl font-semibold text-gray-500">
                    {userData.displayName.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.displayName}
                </h1>
                <p className="text-gray-600">@{userData.username}</p>
                <div className="flex gap-4 mt-3 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {userData.trustScore}% Trust
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatJoinDate(userData.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button
                  onClick={handleEditProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleFollowToggle}
                    className={`${
                      userData.isFollowing
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } px-6 rounded-lg flex items-center gap-2`}
                  >
                    {userData.isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Follow
                      </>
                    )}
                  </Button>
                  <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 rounded-lg flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio + Stats */}
          {userData.bio && (
            <p className="mt-6 text-gray-700 leading-relaxed max-w-2xl">
              {userData.bio}
            </p>
          )}
          <div className="flex gap-6 mt-4 text-gray-700">
            <div>
              <span className="font-bold">{userData.followersCount}</span>{" "}
              Followers
            </div>
            <div>
              <span className="font-bold">{userData.followingCount}</span>{" "}
              Following
            </div>
          </div>
        </Card>

        {/* --- Divider --- */}
        <div className="my-10 border-t border-gray-300 w-11/12 mx-auto" />

        {/* --- Reviews Section --- */}
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isOwnProfile ? "My Reviews" : `${userData.displayName}'s Reviews`}
          </h2>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-500">Loading reviews...</span>
            </div>
          ) : userReviews.length > 0 ? (
            <div className="flex flex-col gap-8">
              {userReviews.map((review) => (
                <ReviewCard
                  key={review.id || review._id}
                  review={{
                    ...review,
                    userName: userData.displayName,
                    userProfilePicture: userData.profilePicture,
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-10 text-center text-gray-500">
                <div className="text-5xl mb-4">📝</div>
                {isOwnProfile
                  ? "You haven't written any reviews yet. Share your first experience!"
                  : `${userData.displayName} hasn't written any reviews yet.`}
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={userData}
        />
      )}
    </div>
  );
};

export default Profile;
