/**
 * Quick Trust Score Test
 * Tests if the trust score calculation is working
 */

import prisma from './apps/user-profile/src/utils/prisma.js';
import { calculateTrustScore } from './apps/user-profile/src/utils/trustScore.js';

async function testTrustScore() {
  try {
    console.log('🧪 Testing Trust Score Calculation\n');
    
    // Get a user with reviews
    const userWithReviews = await prisma.users.findFirst({
      where: {
        reviews: {
          some: {}
        }
      },
      include: {
        reviews: {
          take: 5,
          select: {
            id: true,
            postState: true,
            agreeCount: true,
            disagreeCount: true
          }
        }
      }
    });

    if (!userWithReviews) {
      console.log('❌ No users with reviews found in database');
      return;
    }

    console.log(`\n📊 Testing user: ${userWithReviews.username || userWithReviews.email}`);
    console.log(`   User ID: ${userWithReviews.id}`);
    console.log(`   Sample reviews:`, userWithReviews.reviews);

    // Calculate trust score
    console.log('\n🔍 Calculating trust score...');
    const result = await calculateTrustScore(userWithReviews.id);

    console.log('\n✅ Trust Score Result:');
    console.log('   Trust Score:', result.trustScore);
    console.log('   Breakdown:');
    console.log('     - Total Reviews:', result.breakdown.totalReviews);
    console.log('     - Verified Reviews:', result.breakdown.verifiedReviews);
    console.log('     - Total Agrees:', result.breakdown.totalAgreeCount);
    console.log('     - Agreement %:', result.breakdown.averageAgreePercentage.toFixed(1) + '%');
    console.log('     - Meets Threshold:', result.breakdown.meetsMinimumThreshold);

    if (result.trustScore === 0) {
      console.log('\n⚠️  Trust score is 0. This might mean:');
      console.log('   - User has no reviews (< 1 review)');
      console.log('   - All reviews have 0 agrees');
      console.log('   - No verified reviews');
    }

    // Test a few more users
    const allUsersWithReviews = await prisma.users.findMany({
      where: {
        reviews: {
          some: {}
        }
      },
      take: 5,
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    console.log(`\n\n📊 Testing ${allUsersWithReviews.length} users with reviews:\n`);
    console.log('User ID                          | Username        | Trust Score');
    console.log('-'.repeat(70));

    for (const user of allUsersWithReviews) {
      try {
        const score = await calculateTrustScore(user.id);
        const username = user.username || user.email.split('@')[0];
        console.log(`${user.id.padEnd(35)} | ${username.padEnd(15)} | ${score.trustScore}`);
      } catch (error) {
        console.log(`${user.id.padEnd(35)} | ERROR: ${error.message}`);
      }
    }

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrustScore();
