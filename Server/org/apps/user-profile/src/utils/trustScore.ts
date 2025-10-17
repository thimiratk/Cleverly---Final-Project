/**
 * Trust Score Calculator
 * Calculates user trust score based on review activity and community engagement
 */

import prisma from './prisma';

interface TrustScoreCalculation {
  trustScore: number;
  breakdown: {
    totalReviews: number;
    verifiedReviews: number;
    totalAgreeCount: number;
    averageAgreePercentage: number;
    meetsMinimumThreshold: boolean;
  };
}

/**
 * Calculate trust score for a user
 * 
 * Formula:
 * - Base requirement: At least 10 total reviews
 * - Verified reviews: +5 points per verified review
 * - Agree count: +1 point per agree across all reviews
 * - Agree percentage: Bonus points for high agreement rate
 * 
 * Max score: 100
 */
export async function calculateTrustScore(userId: string): Promise<TrustScoreCalculation> {
  try {
    // Get all reviews for the user
    const reviews = await prisma.reviews.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        postState: true,
        agreeCount: true,
        disagreeCount: true,
        neutralStanceCount: true
      }
    });

    const totalReviews = reviews.length;
    
    // Count verified reviews (VERIFIED postState)
    const verifiedReviews = reviews.filter((r: any) => r.postState === 'VERIFIED').length;
    
    // Calculate total agree count across all reviews
    const totalAgreeCount = reviews.reduce((sum: number, review: any) => sum + (review.agreeCount || 0), 0);
    const totalDisagreeCount = reviews.reduce((sum: number, review: any) => sum + (review.disagreeCount || 0), 0);
    const totalStanceInteractions = totalAgreeCount + totalDisagreeCount;
    
    // Calculate average agree percentage
    const averageAgreePercentage = totalStanceInteractions > 0 
      ? (totalAgreeCount / totalStanceInteractions) * 100 
      : 0;

    // Check if user meets minimum threshold
    const meetsMinimumThreshold = totalReviews >= 5;

    let trustScore = 0;

    if (meetsMinimumThreshold) {
      // Base points for meeting threshold
      trustScore += 10;

      // Points for verified reviews (5 points each, max 50 points)
      const verifiedPoints = Math.min(verifiedReviews * 5, 50);
      trustScore += verifiedPoints;

      // Points for agree count (1 point per 2 agrees, max 30 points)
      const agreePoints = Math.min(Math.floor(totalAgreeCount / 2), 30);
      trustScore += agreePoints;

      // Bonus points for high agreement rate (max 10 points)
      if (averageAgreePercentage >= 80) {
        trustScore += 10;
      } else if (averageAgreePercentage >= 60) {
        trustScore += 7;
      } else if (averageAgreePercentage >= 40) {
        trustScore += 4;
      }

      // Cap at 100
      trustScore = Math.min(trustScore, 100);
    }

    return {
      trustScore,
      breakdown: {
        totalReviews,
        verifiedReviews,
        totalAgreeCount,
        averageAgreePercentage: Math.round(averageAgreePercentage * 10) / 10,
        meetsMinimumThreshold
      }
    };
  } catch (error) {
    console.error('Error calculating trust score:', error);
    throw error;
  }
}

/**
 * Update user's trust score in database
 */
export async function updateUserTrustScore(userId: string): Promise<TrustScoreCalculation> {
  const calculation = await calculateTrustScore(userId);
  
  await prisma.users.update({
    where: { id: userId },
    data: {
      trustScore: calculation.trustScore
    }
  });

  return calculation;
}

/**
 * Recalculate trust scores for all users with reviews
 * Useful for batch updates or migrations
 */
export async function recalculateAllTrustScores(): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    // Get all users who have reviews
    const usersWithReviews = await prisma.users.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      select: {
        id: true
      }
    });

    console.log(`Recalculating trust scores for ${usersWithReviews.length} users...`);

    for (const user of usersWithReviews) {
      try {
        await updateUserTrustScore(user.id);
        updated++;
      } catch (error) {
        console.error(`Failed to update trust score for user ${user.id}:`, error);
        errors++;
      }
    }

    console.log(`Trust score recalculation complete. Updated: ${updated}, Errors: ${errors}`);
  } catch (error) {
    console.error('Error in batch trust score recalculation:', error);
    throw error;
  }

  return { updated, errors };
}

export default {
  calculateTrustScore,
  updateUserTrustScore,
  recalculateAllTrustScores
};
