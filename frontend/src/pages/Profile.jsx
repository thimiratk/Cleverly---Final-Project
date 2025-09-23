import React, { useState } from "react";
import { MapPin, Calendar, Link, Settings, Star, Trophy } from "lucide-react";
import { Button, Badge, Card, CardContent, Avatar, AvatarImage, AvatarFallback, Progress,Tabs,TabsList,TabsTrigger,TabsContent,formatNumber,COMMON_STYLES
} from "../components/ui/UIComponents";
import ProfileEditModal from "./ProfileEditModal";

const ProfilePage = () => {
  const [viewMode] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [userData, setUserData] = useState({
    name: "Sarah Johnson",
    username: "sarahj_reviews",
    email: "sarah@example.com",
    bio: "Tech enthusiast and product reviewer. Love exploring new gadgets!",
    job: "Senior Product Manager",
    location: "San Francisco, CA",
    website: "techreviews.blog",
    avatar: "",
    followers: 1205,
    trustScore: 87,
    badges: ["verified", "expert", "trendsetter"],
  });

  const profileStats = {
    totalReviews: 189,
    totalLikes: 12847,
    averageRating: 4.2,
    topCategory: "Technology",
    joinDate: "March 2023",
  };

  const badgeDetails = {
    verified: {
      name: "Verified Reviewer",
      color: "bg-blue-100 text-blue-700",
      icon: "✓",
    },
    expert: {
      name: "Expert Reviewer",
      color: "bg-purple-100 text-purple-700",
      icon: "🎯",
    },
    trendsetter: {
      name: "Trendsetter",
      color: "bg-pink-100 text-pink-700",
      icon: "🔥",
    },
  };

  const userReviews = [
    {
      id: "1",
      product: "iPhone 15 Pro",
      rating: 5,
      title: "Incredible camera upgrade, but battery life could be better",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop",
      likes: 124,
      comments: 18,
      timestamp: "2 days ago",
    },
    {
      id: "2",
      product: "MacBook Pro M3",
      rating: 4,
      title: "Powerful performance, worth the upgrade from M1",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      likes: 89,
      comments: 12,
      timestamp: "1 week ago",
    },
    {
      id: "3",
      product: "AirPods Pro 2",
      rating: 5,
      title: "Best noise cancellation I've ever experienced",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop",
      likes: 156,
      comments: 24,
      timestamp: "2 weeks ago",
    },
  ];

  const achievements = [
    {
      name: "First Review",
      description: "Posted your first review",
      earned: true,
    },
    {
      name: "Popular Reviewer",
      description: "Got 1000+ likes on reviews",
      earned: true,
    },
    {
      name: "Category Expert",
      description: "Became an expert in Technology",
      earned: true,
    },
    {
      name: "Trend Spotter",
      description: "Reviewed 5 trending products first",
      earned: false,
    },
  ];

  const handleEditProfile = () => setIsEditModalOpen(true);

  const handleSaveProfile = (updatedData) => {
    setUserData((prev) => ({
      ...prev,
      ...updatedData.profile,
      avatar: updatedData.profile.profileImage || prev.avatar,
      email: updatedData.account.email,
    }));
    alert("Profile updated successfully!");
  };

  const onReviewClick = (id) => console.log("Review clicked:", id);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div
        className={`transition-all duration-300 ${
          isEditModalOpen ? "blur-sm brightness-50 pointer-events-none" : ""
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-25">
          {/* Profile Header */}
          <div className={`${COMMON_STYLES.gradientHeader} rounded-2xl p-6 text-white mb-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-white">
                  {userData.avatar ? (
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  <p className="text-blue-100">{userData.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userData.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {profileStats.joinDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Link className="w-4 h-4" />
                      {userData.website}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleEditProfile}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
            {userData.bio && (
              <p className="mt-4 text-blue-100 text-sm">{userData.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profileStats.totalReviews}
                </div>
                <div className="text-sm text-gray-500">Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(userData.followers)}
                </div>
                <div className="text-sm text-gray-500">Followers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(profileStats.totalLikes)}
                </div>
                <div className="text-sm text-gray-500">Likes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {profileStats.averageRating}
                </div>
                <div className="text-sm text-gray-500">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Score & Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Trust Score
                </h3>
                <div className="text-3xl font-bold text-center mb-2">
                  {userData.trustScore}%
                </div>
                <Progress value={userData.trustScore} className="mb-4" />
                <p className="text-sm text-gray-500 text-center">
                  Excellent reviewer with high community trust
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.badges.map((badge) => {
                    const info = badgeDetails[badge];
                    return info ? (
                      <Badge key={badge} className={`${info.color} border-0`}>
                        <span className="mr-1">{info.icon}</span>
                        {info.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>

            {/* Reviews */}
            <TabsContent value="reviews">
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {userReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onReviewClick(review.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={review.image}
                          alt={review.product}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">
                            {review.product}
                          </h3>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {review.title}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{review.timestamp}</span>
                        <div className="flex gap-3">
                          <span>{review.likes} likes</span>
                          <span>{review.comments} comments</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((a) => (
                  <Card
                    key={a.name}
                    className={`${
                      a.earned
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    } shadow-sm`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            a.earned ? "bg-green-100" : "bg-gray-200"
                          }`}
                        >
                          <Trophy
                            className={`w-6 h-6 ${
                              a.earned ? "text-green-600" : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {a.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {a.description}
                          </p>
                        </div>
                        {a.earned && (
                          <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
                            Earned
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Following */}
            <TabsContent value="following">
              <div className="text-center py-8">
                <p className="text-gray-500">Following list coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userData}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;