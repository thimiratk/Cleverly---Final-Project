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
        badges: true, // Legacy badges
        avatar: true,
        assignedBadges: { // New badge system (correct relation name)
          include: {
            badge: true
          }
        },
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

    // Calculate trust score dynamically
    let trustScoreResult;
    try {
      const { calculateTrustScore } = await import('../utils/trustScore.js');
      trustScoreResult = await calculateTrustScore(userId);
      console.log(`✅ Trust score calculated for user ${userId}:`, trustScoreResult.trustScore);
    } catch (error) {
      console.error('❌ Error calculating trust score:', error);
      trustScoreResult = { trustScore: 0, breakdown: {} };
    }

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
      trustScore: trustScoreResult.trustScore,
      badges: (() => {
        try {
          const newBadges = (userProfile.assignedBadges || [])
            .filter((userBadge: any) => userBadge.badge) // Filter out null badges
            .map((userBadge: any) => ({
              id: userBadge.badge.id,
              name: userBadge.badge.name,
              description: userBadge.badge.description,
              imageUrl: userBadge.badge.imageUrl,
              earnedAt: userBadge.assignedAt
            }));
          
          const legacyBadges = (userProfile.badges || []).map((badge: any) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            imageUrl: badge.iconUrl, // Map iconUrl to imageUrl
            earnedAt: badge.earnedAt
          }));
          
          return [...newBadges, ...legacyBadges];
        } catch (badgeError) {
          console.error('Error mapping badges:', badgeError);
          return [];
        }
      })(),
      isFollowing,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };

    return res.json(profileResponse);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
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
        badges: true, // Legacy badges
        avatar: true,
        assignedBadges: { // New badge system (correct relation name)
          include: {
            badge: true
          }
        }
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

    // Calculate trust score dynamically
    let trustScoreResult;
    try {
      const { calculateTrustScore } = await import('../utils/trustScore.js');
      trustScoreResult = await calculateTrustScore(userId);
      console.log(`✅ Trust score calculated for current user ${userId}:`, trustScoreResult.trustScore);
    } catch (error) {
      console.error('❌ Error calculating trust score for current user:', error);
      trustScoreResult = { trustScore: 0, breakdown: {} };
    }

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
      trustScore: trustScoreResult.trustScore,
      badges: (() => {
        try {
          const newBadges = (userProfile.assignedBadges || [])
            .filter((userBadge: any) => userBadge.badge) // Filter out null badges
            .map((userBadge: any) => ({
              id: userBadge.badge.id,
              name: userBadge.badge.name,
              description: userBadge.badge.description,
              imageUrl: userBadge.badge.imageUrl,
              earnedAt: userBadge.assignedAt
            }));
          
          const legacyBadges = (userProfile.badges || []).map((badge: any) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            imageUrl: badge.iconUrl, // Map iconUrl to imageUrl
            earnedAt: badge.earnedAt
          }));
          
          return [...newBadges, ...legacyBadges];
        } catch (badgeError) {
          console.error('Error mapping badges:', badgeError);
          return [];
        }
      })(),
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    };

    return res.json(profileResponse);
  } catch (error) {
    console.error('❌ Error fetching current user profile:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
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

    // Create notification for the followed user
    try {
      const { createNotification } = await import('./notification.controller');
      const follower = await prisma.users.findUnique({
        where: { id: currentUserId },
        select: { name: true, username: true }
      });

      if (follower) {
        await createNotification(
          userId,
          'FOLLOW',
          'New Follower',
          `${follower.username || follower.name} started following you`,
          { followerId: currentUserId },
          currentUserId
        );
      }
    } catch (notifError) {
      console.error('Error creating follow notification:', notifError);
      // Don't fail the follow operation if notification fails
    }

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
        badges: true
      }
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate trust score dynamically
    let trustScoreResult;
    try {
      const { calculateTrustScore } = await import('../utils/trustScore.js');
      trustScoreResult = await calculateTrustScore(userId);
      console.log(`✅ Trust score calculated for badges request ${userId}:`, trustScoreResult.trustScore);
    } catch (error) {
      console.error('❌ Error calculating trust score for badges:', error);
      trustScoreResult = { trustScore: 0, breakdown: {} };
    }

    return res.json({
      badges: userProfile.badges.map((badge: any) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        earnedAt: badge.earnedAt
      })),
      trustScore: trustScoreResult.trustScore
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user trust score with breakdown
export const getUserTrustScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { calculateTrustScore } = await import('../utils/trustScore.js');
    const result = await calculateTrustScore(userId);
    
    return res.json(result);
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return res.status(500).json({ error: 'Failed to calculate trust score' });
  }
};

// Update user trust score (recalculate on-the-fly, same as get)
export const updateTrustScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const { calculateTrustScore } = await import('../utils/trustScore.js');
    const result = await calculateTrustScore(userId);
    
    return res.json({
      message: 'Trust score calculated successfully (no database update needed)',
      ...result
    });
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return res.status(500).json({ error: 'Failed to calculate trust score' });
  }
};

// Recalculate all user trust scores (admin only) - returns calculated scores
export const recalculateAllTrustScores = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get all users who have reviews
    const usersWithReviews = await prisma.users.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      select: {
        id: true,
        username: true
      }
    });

    const { calculateTrustScore } = await import('../utils/trustScore.js');
    const results = [];
    let errors = 0;

    for (const user of usersWithReviews) {
      try {
        const score = await calculateTrustScore(user.id);
        results.push({
          userId: user.id,
          username: user.username,
          trustScore: score.trustScore
        });
      } catch (error) {
        console.error(`Failed to calculate trust score for user ${user.id}:`, error);
        errors++;
      }
    }
    
    return res.json({
      message: 'Trust scores calculated successfully (calculated on-the-fly, not stored)',
      totalUsers: usersWithReviews.length,
      calculated: results.length,
      errors,
      topScores: results.sort((a, b) => b.trustScore - a.trustScore).slice(0, 10)
    });
  } catch (error) {
    console.error('Error calculating trust scores:', error);
    return res.status(500).json({ error: 'Failed to calculate trust scores' });
  }
};

// Get top reviewers for discover page
export const getTopReviewers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get users with most reviews and calculate their stats
    const usersWithReviews = await prisma.users.findMany({
      include: {
        reviews: {
          where: {
            postState: { not: 'REJECTED' }
          }
        },
        assignedBadges: {
          include: {
            badge: true
          }
        },
        avatar: true,
        _count: {
          select: {
            followersRelation: true,
            reviews: true
          }
        }
      }
    });

    // Calculate trust scores and format data
    const { calculateTrustScore } = await import('../utils/trustScore.js');
    
    const reviewersWithStats = await Promise.all(
      usersWithReviews
        .filter((user: any) => user._count.reviews > 0)
        .map(async (user: any) => {
          const trustScoreResult = await calculateTrustScore(user.id);
          
          // Get review categories
          const reviewsByCategory = await prisma.reviews.groupBy({
            by: ['categoryId'],
            where: {
              userId: user.id,
              postState: { not: 'REJECTED' },
              categoryId: { not: null }
            },
            _count: true
          });

          const topCategories = await Promise.all(
            reviewsByCategory
              .sort((a: any, b: any) => b._count - a._count)
              .slice(0, 2)
              .map(async (cat: any) => {
                if (!cat.categoryId) return null;
                const category = await prisma.categories.findUnique({
                  where: { id: cat.categoryId }
                });
                return category?.name || 'Other';
              })
          );

          return {
            id: user.id,
            name: user.name,
            username: user.username || `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
            trustScore: `${Math.round(trustScoreResult.trustScore)}%`,
            reviews: user._count.reviews,
            followers: user._count.followersRelation,
            categories: topCategories.filter(Boolean),
            profilePicture: user.profilePicture,
            avatar: user.avatar?.url,
            badges: user.assignedBadges.map((ab: any) => ({
              id: ab.badge.id,
              name: ab.badge.name,
              icon: ab.badge.icon
            }))
          };
        })
    );

    // Sort by trust score and number of reviews
    const topReviewers = reviewersWithStats
      .sort((a, b) => {
        const scoreA = parseInt(a.trustScore);
        const scoreB = parseInt(b.trustScore);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.reviews - a.reviews;
      })
      .slice(0, limit);

    console.log(`Found ${topReviewers.length} top reviewers`);
    return res.json(topReviewers);
  } catch (error) {
    console.error('Error getting top reviewers:', error);
    return res.status(500).json({ error: 'Failed to fetch top reviewers' });
  }
};

// Search users
export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(200).json({ users: [], total: 0 });
    }

    const searchTerm = q.trim().toLowerCase();
    
    // Build search filters
    const searchFilters: any = {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          username: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          bio: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ]
    };

    const users = await prisma.users.findMany({
      where: searchFilters,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        profilePicture: true,
        coverPicture: true,
        trustScore: true,
        createdAt: true,
        avatar: {
          select: {
            url: true
          }
        },
        _count: {
          select: {
            reviews: true,
            followersRelation: true,
            followingRelation: true
          }
        }
      },
      take: Number(limit),
      orderBy: [
        { trustScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Format the response
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture || user.avatar?.url,
      coverPicture: user.coverPicture,
      trustScore: user.trustScore || '0',
      reviewsCount: user._count.reviews,
      followersCount: user._count.followersRelation,
      followingCount: user._count.followingRelation,
      createdAt: user.createdAt
    }));

    return res.status(200).json({ 
      users: formattedUsers,
      total: formattedUsers.length,
      query: q
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
};