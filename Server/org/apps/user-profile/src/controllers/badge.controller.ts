/**
 * Badge Controller
 * Handles all badge-related operations including creation, assignment, and eligibility
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drltde5us',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Criteria type definition
interface BadgeCriteria {
  followers?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  totalReviews?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  verifiedReviews?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  upvotes?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  downvotes?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  totalComments?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  agreeComments?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  disagreeComments?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
  agreePercentage?: { enabled: boolean; operator: 'more_than' | 'less_than' | 'equal'; value: number };
}

/**
 * Create a new badge
 */
export const createBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, category, criteria, createdBy } = req.body;

    // Validate required fields
    if (!name || !description || !category || !criteria) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, category, and criteria are required'
      });
    }

    // Check if badge with same name already exists
    const existingBadge = await prisma.badge.findUnique({
      where: { name }
    });

    if (existingBadge) {
      return res.status(409).json({
        success: false,
        message: 'Badge with this name already exists'
      });
    }

    // Validate createdBy is a valid ObjectID if provided
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    
    // Create the badge
    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        imageUrl,
        category,
        criteria: criteria,
        createdBy: createdBy && isValidObjectId(createdBy) ? createdBy : null,
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      badge
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create badge',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all badges
 */
export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const badges = await prisma.badge.findMany({
      where: isActive !== undefined ? { isActive: isActive === 'true' } : undefined,
      include: {
        userBadges: {
          select: {
            id: true,
            userId: true,
            assignedAt: true
          }
        },
        _count: {
          select: {
            userBadges: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      badges,
      total: badges.length
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get badge by ID
 */
export const getBadgeById = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;

    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        userBadges: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                profilePicture: true
              }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        },
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    return res.status(200).json({
      success: true,
      badge
    });
  } catch (error) {
    console.error('Error fetching badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Update badge
 */
export const updateBadge = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const { name, description, imageUrl, category, criteria, isActive } = req.body;

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!existingBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if new name conflicts with another badge
    if (name && name !== existingBadge.name) {
      const nameConflict = await prisma.badge.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: 'Badge with this name already exists'
        });
      }
    }

    // Update the badge
    const updatedBadge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category && { category }),
        ...(criteria && { criteria }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Badge updated successfully',
      badge: updatedBadge
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Delete badge
 */
export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;

    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (badge.imageUrl) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
        const urlParts = badge.imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Skip transformation part, get public_id (everything after transformations)
          const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove file extension

          // Delete from Cloudinary
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`, result);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with badge deletion even if Cloudinary deletion fails
      }
    }

    // Delete the badge (cascade will remove UserBadge assignments)
    await prisma.badge.delete({
      where: { id: badgeId }
    });

    return res.status(200).json({
      success: true,
      message: `Badge deleted successfully. ${badge._count.userBadges} user assignments removed.`,
      deletedAssignments: badge._count.userBadges
    });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Calculate user statistics for badge criteria evaluation
 */
async function calculateUserStats(userId: string) {
  try {
    // Get user with basic info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profilePicture: true,
        followersCount: true
      }
    });

    if (!user) return null;

    // Get review statistics
    const reviews = await prisma.reviews.findMany({
      where: { userId },
      select: {
        id: true,
        postState: true,
        upvotesCount: true,
        downvotesCount: true,
        comments: {
          select: {
            id: true,
            stance: true
          }
        }
      }
    });

    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter((r: any) => r.postState === 'VERIFIED').length;
    const totalUpvotes = reviews.reduce((sum: number, r: any) => sum + r.upvotesCount, 0);
    const totalDownvotes = reviews.reduce((sum: number, r: any) => sum + r.downvotesCount, 0);

    // Get comment statistics
    const comments = await prisma.reviewComments.findMany({
      where: { userId },
      select: {
        id: true,
        stance: true
      }
    });

    const totalComments = comments.length;
    const agreeComments = comments.filter((c: any) => c.stance === 'AGREE').length;
    const disagreeComments = comments.filter((c: any) => c.stance === 'DISAGREE').length;
    const agreePercentage = totalComments > 0 
      ? Math.round((agreeComments / totalComments) * 100) 
      : 0;

    return {
      user,
      stats: {
        followers: user.followersCount,
        totalReviews,
        verifiedReviews,
        upvotes: totalUpvotes,
        downvotes: totalDownvotes,
        totalComments,
        agreeComments,
        disagreeComments,
        agreePercentage
      }
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return null;
  }
}

/**
 * Evaluate if a user meets badge criteria
 */
function evaluateCriteria(userStats: any, criteria: BadgeCriteria): boolean {
  const stats = userStats.stats;

  // Helper function to check a criterion
  const checkCriterion = (stat: number, criterion: any): boolean => {
    if (!criterion || !criterion.enabled) return true;

    switch (criterion.operator) {
      case 'more_than':
        return stat > criterion.value;
      case 'less_than':
        return stat < criterion.value;
      case 'equal':
        return stat === criterion.value;
      default:
        return true;
    }
  };

  // Check all enabled criteria
  const checks = [
    checkCriterion(stats.followers, criteria.followers),
    checkCriterion(stats.totalReviews, criteria.totalReviews),
    checkCriterion(stats.verifiedReviews, criteria.verifiedReviews),
    checkCriterion(stats.upvotes, criteria.upvotes),
    checkCriterion(stats.downvotes, criteria.downvotes),
    checkCriterion(stats.totalComments, criteria.totalComments),
    checkCriterion(stats.agreeComments, criteria.agreeComments),
    checkCriterion(stats.disagreeComments, criteria.disagreeComments),
    checkCriterion(stats.agreePercentage, criteria.agreePercentage)
  ];

  // All enabled criteria must pass
  return checks.every(check => check === true);
}

/**
 * Get eligible users for a badge
 */
export const getEligibleUsers = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;

    // Get the badge with criteria
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Get all users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profilePicture: true,
        followersCount: true,
        assignedBadges: {
          where: { badgeId },
          select: { id: true }
        }
      }
    });

    // Filter users who already have this badge
    const usersWithoutBadge = users.filter((u: any) => u.assignedBadges.length === 0);

    // Calculate stats and check eligibility for each user
    const eligibleUsersPromises = usersWithoutBadge.map(async (user: any) => {
      const userStats = await calculateUserStats(user.id);
      if (!userStats) return null;

      const isEligible = evaluateCriteria(userStats, badge.criteria as BadgeCriteria);

      if (isEligible) {
        return {
          ...userStats.user,
          stats: userStats.stats,
          isEligible: true
        };
      }

      return null;
    });

    const eligibleUsersResults = await Promise.all(eligibleUsersPromises);
    const eligibleUsers = eligibleUsersResults.filter((u: any) => u !== null);

    return res.status(200).json({
      success: true,
      badge: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        criteria: badge.criteria
      },
      eligibleUsers,
      total: eligibleUsers.length
    });
  } catch (error) {
    console.error('Error getting eligible users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get eligible users',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Assign badge to a user
 */
export const assignBadge = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const { userId, assignedBy } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has this badge
    const existingAssignment = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Get user stats at time of assignment
    const userStats = await calculateUserStats(userId);

    // Validate assignedBy is a valid ObjectID if provided
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    // Assign the badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        assignedBy: assignedBy && isValidObjectId(assignedBy) ? assignedBy : null,
        criteriaMetAt: userStats ? userStats.stats : null
      },
      include: {
        badge: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profilePicture: true
          }
        }
      }
    });

    // Create notification for the user
    try {
      await prisma.notifications.create({
        data: {
          userId,
          type: 'REVIEW_STATUS', // Using REVIEW_STATUS for badge assignments
          title: 'New Badge Earned! 🎉',
          message: `Congratulations! You've been awarded the "${badge.name}" badge`,
          data: {
            badgeId: badge.id,
            badgeName: badge.name,
            badgeImageUrl: badge.imageUrl
          },
          relatedUserId: assignedBy && isValidObjectId(assignedBy) ? assignedBy : null,
          isRead: false
        }
      });
    } catch (notifError) {
      console.error('Error creating badge notification:', notifError);
      // Don't fail the badge assignment if notification fails
    }

    return res.status(201).json({
      success: true,
      message: 'Badge assigned successfully',
      userBadge
    });
  } catch (error) {
    console.error('Error assigning badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Bulk assign badges to multiple users
 */
export const bulkAssignBadges = async (req: Request, res: Response) => {
  try {
    const { badgeId, userIds, assignedBy } = req.body;

    if (!badgeId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Badge ID and array of user IDs are required'
      });
    }

    // Check if badge exists
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    const results = {
      successful: [] as any[],
      failed: [] as any[],
      skipped: [] as any[]
    };

    // Process each user
    for (const userId of userIds) {
      try {
        // Check if user exists
        const user = await prisma.users.findUnique({
          where: { id: userId }
        });

        if (!user) {
          results.failed.push({ userId, reason: 'User not found' });
          continue;
        }

        // Check if user already has badge
        const existingAssignment = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId
            }
          }
        });

        if (existingAssignment) {
          results.skipped.push({ userId, reason: 'Already has badge' });
          continue;
        }

        // Get user stats
        const userStats = await calculateUserStats(userId);

        // Validate assignedBy is a valid ObjectID if provided
        const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

        // Assign badge
        const userBadge = await prisma.userBadge.create({
          data: {
            userId,
            badgeId,
            assignedBy: assignedBy && isValidObjectId(assignedBy) ? assignedBy : null,
            criteriaMetAt: userStats ? userStats.stats : null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        });

        // Create notification for the user
        try {
          await prisma.notifications.create({
            data: {
              userId,
              type: 'REVIEW_STATUS',
              title: 'New Badge Earned! 🎉',
              message: `Congratulations! You've been awarded the "${badge.name}" badge`,
              data: {
                badgeId: badge.id,
                badgeName: badge.name,
                badgeImageUrl: badge.imageUrl
              },
              relatedUserId: assignedBy && isValidObjectId(assignedBy) ? assignedBy : null,
              isRead: false
            }
          });
        } catch (notifError) {
          console.error(`Error creating badge notification for user ${userId}:`, notifError);
        }

        results.successful.push(userBadge);
      } catch (error) {
        results.failed.push({ userId, reason: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk assignment completed. ${results.successful.length} successful, ${results.skipped.length} skipped, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error in bulk badge assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform bulk assignment',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get badges for a specific user
 */
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      badges: userBadges,
      total: userBadges.length
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user badges',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Get badge statistics for overview
 */
export const getBadgeStatistics = async (req: Request, res: Response) => {
  try {
    // Get all badges with assignment counts
    const badges = await prisma.badge.findMany({
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    // Get recent assignments (last 10)
    const recentAssignments = await prisma.userBadge.findMany({
      take: 10,
      orderBy: {
        assignedAt: 'desc'
      },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });

    // Calculate totals
    const totalBadges = badges.length;
    const activeBadges = badges.filter((b: any) => b.isActive).length;
    const totalAssignments = badges.reduce((sum, b) => sum + b._count.userBadges, 0);

    return res.status(200).json({
      success: true,
      statistics: {
        totalBadges,
        activeBadges,
        inactiveBadges: totalBadges - activeBadges,
        totalAssignments,
        recentAssignments
      },
      badges: badges.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        imageUrl: b.imageUrl,
        isActive: b.isActive,
        assignedCount: b._count.userBadges,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching badge statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch badge statistics',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

/**
 * Remove badge from user
 */
export const removeBadgeFromUser = async (req: Request, res: Response) => {
  try {
    const { userId, badgeId } = req.params;

    // Check if assignment exists
    const userBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge assignment not found'
      });
    }

    // Remove the assignment
    await prisma.userBadge.delete({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Badge removed from user successfully'
    });
  } catch (error) {
    console.error('Error removing badge:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove badge',
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

