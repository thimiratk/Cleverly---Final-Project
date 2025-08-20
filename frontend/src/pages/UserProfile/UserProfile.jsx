import Header from '../../components/Layout/Header'
import React, { useState } from 'react'
import { Edit3, Grid3X3, Heart, Eye, Save, X, Plus, MessageSquare, Badge, MapPin, GraduationCap, Briefcase, Camera } from 'lucide-react'
import image1 from '../../assets/posts/phone1.jpg'
import image2 from '../../assets/posts/phone2.png'
import Audi from '../../assets/posts/audi.png'

const UserProfile = () => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [userName, setUserName] = useState("Jack Gabel")
  const [tempUserName, setTempUserName] = useState(userName)
  
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [userBio, setUserBio] = useState("")
  const [tempUserBio, setTempUserBio] = useState("")
  
  const [userDetails, setUserDetails] = useState({
    badge: "Electronic Expert",
    job: "Software Engineer",
    location: "Denver, Colorado",
    work: "Amazon (Customer Experience Specialist)"
  })
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [tempDetails, setTempDetails] = useState(userDetails)
  
  const [activities, setActivities] = useState([
    {
      id: 1,
      author: "Jack Gabel",
      time: "4h",
      content: "Absolutely love this body wash! It leaves my skin feeling soft and hydrated all day. The scent is refreshing but not overpowering....",
      likes: 12,
      views: 156,
      isLiked: false,
      category: "Beauty & Personal Care",
      images: [image1, Audi] // multiple images
    },
    {
      id: 2,
      author: "Jack Gabel",
      time: "3h",
      content: "Absolutely love this body wash! It leaves my skin feeling soft and hydrated all day. The scent is refreshing but not overpowering....",
      likes: 22,
      views: 156,
      isLiked: false,
      category: "Beauty & Personal Care",
      images: [image2]
    },
    {
      id: 3,
      author: "Jack Gabel",
      time: "1d",
      content: "This product exceeded my expectations! The quality is outstanding and the delivery was super fast. Highly recommend to anyone looking for...",
      likes: 8,
      views: 98,
      isLiked: true,
      category: "Electronics",
      images: [image1]
    },
    {
      id: 4,
      author: "Jack Gabel",
      time: "2d",
      content: "Great value for money. The features are exactly what I needed and the customer service was excellent when I had questions...",
      likes: 15,
      views: 203,
      isLiked: false,
      category: "Home & Garden",
      images: [image2]
    },
    {
      id: 5,
      author: "Jack Gabel",
      time: "3d",
      content: "I've been using this for a month now and I'm really impressed with the results. It's become a staple in my daily routine...",
      likes: 31,
      views: 412,
      isLiked: true,
      category: "Health & Wellness",
      images: [image1]
    }
  ])

  const [showExtraFeatures, setShowExtraFeatures] = useState(false)
  
  // Track current image index for each activity for carousel
  const [imageIndexes, setImageIndexes] = useState(
    activities.reduce((acc, activity) => {
      acc[activity.id] = 0
      return acc
    }, {})
  )

  const handleNameSave = () => {
    setUserName(tempUserName)
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setTempUserName(userName)
    setIsEditingName(false)
  }

  const handleBioSave = () => {
    setUserBio(tempUserBio)
    setIsEditingBio(false)
  }

  const handleBioCancel = () => {
    setTempUserBio(userBio)
    setIsEditingBio(false)
  }

  const handleDetailsave = () => {
    setUserDetails(tempDetails)
    setIsEditingDetails(false)
  }

  const handleDetailsCancel = () => {
    setTempDetails(userDetails)
    setIsEditingDetails(false)
  }

  const toggleLike = (activityId) => {
    setActivities(activities.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          isLiked: !activity.isLiked,
          likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1
        }
      }
      return activity
    }))
  }

  const handleComment = (activityId) => {
    console.log("Comment on activity:", activityId)
  }

  const handleProfilePictureChange = () => {
    alert("Profile picture change functionality would open file selector or camera options")
  }
  
  // Handle prev image in carousel
  const prevImage = (activityId) => {
    setImageIndexes(prev => {
      const currentIndex = prev[activityId]
      const newIndex = currentIndex === 0 ? activities.find(a => a.id === activityId).images.length - 1 : currentIndex - 1
      return {...prev, [activityId]: newIndex}
    })
  }
  
  // Handle next image in carousel
  const nextImage = (activityId) => {
    setImageIndexes(prev => {
      const currentIndex = prev[activityId]
      const length = activities.find(a => a.id === activityId).images.length
      const newIndex = currentIndex === length - 1 ? 0 : currentIndex + 1
      return {...prev, [activityId]: newIndex}
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-18">
      <Header />
      <div className="pt-16">
      
      {/* Profile Header Section */}
      <div className="relative bg-gradient-to-r from-blue-400 to-blue-500 pt-0 ">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format" 
              alt={userName} 
              className="w-32 h-32 rounded-full border-4 border-white object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleProfilePictureChange}
            />
            <button 
              onClick={handleProfilePictureChange}
              className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 pb-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                className="text-2xl font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 text-center"
                autoFocus
              />
              <button onClick={handleNameSave} className="text-green-500 hover:text-green-600">
                <Save className="w-5 h-5" />
              </button>
              <button onClick={handleNameCancel} className="text-red-500 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
              <button onClick={() => setIsEditingName(true)} className="text-orange-500 hover:text-orange-600">
                <Edit3 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-blue-600 font-medium">Diamond Contributor</span>
        </div>
      </div>

      {/* Main Content Grid with Fixed Sidebars */}
      <div className="max-w-7xl mx-auto px-2 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
          
          {/* About Section - Fixed */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">About</h2>
                <Grid3X3 className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* Bio Section */}
              {userBio || isEditingBio ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700">Bio</h3>
                    {!isEditingBio && (
                      <button onClick={() => setIsEditingBio(true)} className="text-orange-500 hover:text-orange-900">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {isEditingBio ? (
                    <div>
                      <textarea
                        value={tempUserBio}
                        onChange={(e) => setTempUserBio(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                        rows="3"
                        placeholder="Tell us about yourself..."
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button onClick={handleBioCancel} className="text-red-500 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={handleBioSave} className="text-green-500 hover:text-green-600">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">{userBio}</p>
                  )}
                </div>
              ) : null}
              
              {/* Details Section */}
              <div className="space-y-4 text-sm">
                {isEditingDetails ? (
                  <div className="space-y-3">
                    
                    <div className="flex flex-col">
                      <label className="text-gray-600 mb-1 flex items-center">
                        <Briefcase  className="w-4 h-4 mr-1" />
                        Job
                      </label>
                      <input
                        type="text"
                        value={tempDetails.job}
                        onChange={(e) => setTempDetails({...tempDetails, job: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-600 mb-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Lives in
                      </label>
                      <input
                        type="text"
                        value={tempDetails.location}
                        onChange={(e) => setTempDetails({...tempDetails, location: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-gray-600 mb-1 flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        Works at
                      </label>
                      <input
                        type="text"
                        value={tempDetails.work}
                        onChange={(e) => setTempDetails({...tempDetails, work: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button 
                        onClick={handleDetailsCancel}
                        className="px-3 py-1 text-red-500 hover:text-red-600 border border-red-200 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDetailsave}
                        className="px-3 py-1 text-green-500 hover:text-green-600 border border-green-200 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start">
                      <Badge  className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Badge : </span>
                        <span className="text-gray-800">{userDetails.badge}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Briefcase  className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Job : </span>
                        <span className="text-gray-800">{userDetails.job}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Lives in </span>
                        <span className="text-gray-800">{userDetails.location}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Briefcase className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Works at </span>
                        <span className="text-gray-800">{userDetails.work}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {!userBio && !isEditingBio && (
                  <button 
                    onClick={() => setIsEditingBio(true)}
                    className="w-full bg-blue-100 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bio
                  </button>
                )}
                <button 
                  onClick={() => setIsEditingDetails(!isEditingDetails)}
                  className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {isEditingDetails ? 'Cancel Edit' : 'Edit Details'}
                </button>
                <button 
                  onClick={() => setShowExtraFeatures(!showExtraFeatures)}
                  className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showExtraFeatures ? 'Hide Extra Features' : 'Add Extra Features'}
                </button>
                
                {showExtraFeatures && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">Extra Features</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left p-2 hover:bg-white rounded text-sm text-gray-600">
                        📱 Add Social Links
                      </button>
                      <button className="w-full text-left p-2 hover:bg-white rounded text-sm text-gray-600">
                        🏆 Add Achievements
                      </button>
                      <button className="w-full text-left p-2 hover:bg-white rounded text-sm text-gray-600">
                        📊 Add Skills
                      </button>
                      <button className="w-full text-left p-2 hover:bg-white rounded text-sm text-gray-600">
                        🎯 Add Interests
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Your Activities Section - Scrollable */}
          <div className="lg:col-span-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Activities</h2>
              <Grid3X3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800 text-sm">{activity.author}</span>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{activity.time}</span>
                      <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">{activity.category}</span>
                    </div>
                    
                    {/* KEEP THIS CODE BLOCK EXACTLY AS YOU SHARED */}
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleLike(activity.id)}
                        className="flex items-center space-x-1 group"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${
                            activity.isLiked 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`} 
                        />
                        <span className="text-xs text-gray-500">{activity.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{activity.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleComment(activity.id)}
                          className="flex items-center space-x-1 text-sm text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Comment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{activity.content}</p>
                  
                  {/* Show multiple images with prev/next arrows */}
                  {activity.images.length > 0 && (
                    <div className="relative max-w-md mx-auto mb-4 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={activity.images[imageIndexes[activity.id]]}
                        alt={`Activity ${activity.id} image`}
                        className="w-full h-48 object-cover"
                      />
                      {activity.images.length > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(activity.id)}
                            className="absolute top-1/2 left-1 bg-black bg-opacity-30 text-white p-1 rounded-full transform -translate-y-1/2 hover:bg-opacity-50"
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => nextImage(activity.id)}
                            className="absolute top-1/2 right-1 bg-black bg-opacity-30 text-white p-1 rounded-full transform -translate-y-1/2 hover:bg-opacity-50"
                            aria-label="Next image"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Section - NO CHANGES as requested */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Performance</h2>
                <Grid3X3 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="text-center p-4 bg-green-50 rounded-lg flex-1 mr-2">
                    <h3 className="text-gray-600 text-sm mb-1">Trust Score</h3>
                    <div className="text-3xl font-bold text-green-600">100/100</div>
                    <div className="text-xs text-gray-500 mt-1">Perfect Rating</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg flex-1 ml-2">
                    <h3 className="text-gray-600 text-sm mb-1 flex items-center justify-center">
                      Total Views
                      <Eye className="w-4 h-4 ml-1" />
                    </h3>
                    <div className="text-3xl font-bold text-blue-600">
                      {activities.reduce((sum, activity) => sum + activity.views, 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">All Time</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-gray-600 text-sm mb-1">Profile Views</h3>
                  <div className="text-3xl font-bold text-purple-600">23</div>
                  <div className="text-xs text-gray-500 mt-1">This Month</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <h3 className="text-gray-600 text-sm mb-1">Total Likes</h3>
                  <div className="text-3xl font-bold text-orange-600">
                    {activities.reduce((sum, activity) => sum + activity.likes, 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">All Reviews</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      </div>
    </div>
  )
}

export default UserProfile