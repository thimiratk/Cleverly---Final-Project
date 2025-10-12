import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, uploadCoverToCloudinary } from '../utils/fileUpload';
import prisma from '../utils/prisma';

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        avatar: true,
        followersRelation: currentUserId ? {
          where: {
            followerId: currentUserId
          }
        } : false
      }
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.userFollows.count({
        where: { followingId: userId }
      }),
      prisma.userFollows.count({
        where: { followerId: userId }
      })
    ]);

    // Check if current user is following this profile
    const isFollowing = currentUserId && userProfile.followersRelation && userProfile.followersRelation.length > 0;

    const profileResponse = {
      id: userProfile.id,
      userId: userProfile.id,
      username: userProfile.username || userProfile.email.split('@')[0],
      name: userProfile.name,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      bio: userProfile.bio,
      profilePicture: userProfile.profilePicture || userProfile.avatar?.url,
      coverPicture: userProfile.coverPicture,
  followersCount,
  followingCount,
      trustScore: userProfile.trustScore,
      badges: userProfile.badges.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        earnedAt: badge.earnedAt
      })),
      isFollowing,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };

    return res.json(profileResponse);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        badges: true,
        avatar: true
      }
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.userFollows.count({
        where: { followingId: userId }
      }),
      prisma.userFollows.count({
        where: { followerId: userId }
      })
    ]);

    const profileResponse = {
      id: userProfile.id,
      userId: userProfile.id,
      username: userProfile.username || userProfile.email.split('@')[0],
      name: userProfile.name,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      bio: userProfile.bio,
      profilePicture: userProfile.profilePicture || userProfile.avatar?.url,
      coverPicture: userProfile.coverPicture,
  followersCount,
  followingCount,
      trustScore: userProfile.trustScore,
      badges: userProfile.badges.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        earnedAt: badge.earnedAt
      })),
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };

    return res.json(profileResponse);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, firstName, lastName, bio, profilePicture, coverPicture } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate username uniqueness if username is being updated
    if (username) {
      const existingUser = await prisma.users.findFirst({
        where: {
          username: username,
          id: { not: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (username !== undefined) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (coverPicture !== undefined) updateData.coverPicture = coverPicture;

    // Update the user profile
    const updatedProfile = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      include: {
        badges: true,
        avatar: true
      }
    });

    return res.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        userId: updatedProfile.id,
        username: updatedProfile.username,
        email: updatedProfile.email,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        bio: updatedProfile.bio,
        profilePicture: updatedProfile.profilePicture || updatedProfile.avatar?.url,
        coverPicture: updatedProfile.coverPicture,
        followersCount: updatedProfile.followersCount,
        followingCount: updatedProfile.followingCount,
        trustScore: updatedProfile.trustScore,
        badges: updatedProfile.badges,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Upload profile picture - File info:', req.file);
    console.log('Upload profile picture - User ID:', userId);

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'profile-pictures', userId);

    // Update user profile
    await prisma.users.update({
      where: { id: userId },
      data: {
        profilePicture: imageUrl,
        updatedAt: new Date()
      }
    });

    return res.json({
      message: 'Profile picture updated successfully',
      profilePicture: imageUrl
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
};

export const uploadCoverPicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Upload cover picture - File info:', req.file);
    console.log('Upload cover picture - User ID:', userId);

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadCoverToCloudinary(req.file.buffer, 'cover-pictures', userId);

    // Update user profile
    await prisma.users.update({
      where: { id: userId },
      data: {
        coverPicture: imageUrl,
        updatedAt: new Date()
      }
    });

    return res.json({
      message: 'Cover picture updated successfully',
      coverPicture: imageUrl
    });
  } catch (error) {
    console.error('Error uploading cover picture:', error);
    return res.status(500).json({ error: 'Failed to upload cover picture' });
  }
};

export const getFollowStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [followersCount, followingCount, followRelation] = await Promise.all([
      prisma.userFollows.count({
        where: { followingId: userId }
      }),
      prisma.userFollows.count({
        where: { followerId: userId }
      }),
      currentUserId ? prisma.userFollows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId
          }
        }
      }) : Promise.resolve(null)
    ]);

    const followStats = {
      followersCount,
      followingCount,
      isFollowing: Boolean(followRelation)
    };

    return res.json(followStats);
  } catch (error) {
    console.error('Error fetching follow stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFollow = await prisma.userFollows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Update both users in a transaction
    await prisma.$transaction([
      prisma.userFollows.create({
        data: {
          followerId: currentUserId,
          followingId: userId
        }
      }),
      prisma.users.update({
        where: { id: userId },
        data: {
          followersCount: { increment: 1 }
        }
      }),
      prisma.users.update({
        where: { id: currentUserId },
        data: {
          followingCount: { increment: 1 }
        }
      })
    ]);

    return res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [targetUser, followRelation] = await Promise.all([
      prisma.users.findUnique({
        where: { id: userId },
        select: { id: true }
      }),
      prisma.userFollows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId
          }
        }
      })
    ]);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!followRelation) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Update both users in a transaction
    await prisma.$transaction([
      prisma.userFollows.delete({
        where: { id: followRelation.id }
      }),
      prisma.users.update({
        where: { id: userId },
        data: {
          followersCount: { decrement: 1 }
        }
      }),
      prisma.users.update({
        where: { id: currentUserId },
        data: {
          followingCount: { decrement: 1 }
        }
      })
    ]);

    return res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBadges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        trustScore: true,
        badges: true
      }
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      badges: userProfile.badges.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        earnedAt: badge.earnedAt
      })),
      trustScore: userProfile.trustScore
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};