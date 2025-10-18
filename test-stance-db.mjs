#!/usr/bin/env node
import prisma from './Server/org/packages/libs/prisma/index.js';

async function testStanceUpdate() {
  try {
    console.log('Testing stance database update...');
    
    // First, let's see if we can find any existing comments
    const existingComments = await prisma.reviewComments.findMany({
      take: 1,
      select: {
        id: true,
        content: true,
        stance: true,
        stanceConfidence: true,
        stanceReasoning: true,
        stanceAnalyzedAt: true
      }
    });
    
    if (existingComments.length > 0) {
      const comment = existingComments[0];
      console.log('Found existing comment:', {
        id: comment.id,
        content: comment.content.substring(0, 50) + '...',
        currentStance: comment.stance,
        confidence: comment.stanceConfidence
      });
      
      // Try to update this comment with stance data
      console.log('Attempting to update comment with stance data...');
      
      const updatedComment = await prisma.reviewComments.update({
        where: { id: comment.id },
        data: {
          stance: 'NEUTRAL',
          stanceConfidence: 0.85,
          stanceReasoning: 'Test stance analysis',
          stanceAnalyzedAt: new Date(),
        },
        select: {
          id: true,
          stance: true,
          stanceConfidence: true,
          stanceReasoning: true,
          stanceAnalyzedAt: true
        }
      });
      
      console.log('✅ Successfully updated comment:', updatedComment);
      
      // Verify the update
      const verifyComment = await prisma.reviewComments.findUnique({
        where: { id: comment.id },
        select: {
          stance: true,
          stanceConfidence: true,
          stanceReasoning: true,
          stanceAnalyzedAt: true
        }
      });
      
      console.log('✅ Verified update:', verifyComment);
      
    } else {
      console.log('No existing comments found. Creating a test comment...');
      
      // Find an existing review to attach the comment to
      const existingReviews = await prisma.reviews.findMany({
        take: 1,
        select: { id: true, reviewText: true }
      });
      
      if (existingReviews.length > 0) {
        const review = existingReviews[0];
        console.log('Found review:', review.id);
        
        // Find an existing user
        const existingUsers = await prisma.users.findMany({
          take: 1,
          select: { id: true }
        });
        
        if (existingUsers.length > 0) {
          const user = existingUsers[0];
          console.log('Found user:', user.id);
          
          // Create a test comment with stance data
          const newComment = await prisma.reviewComments.create({
            data: {
              content: 'This is a test comment for stance analysis',
              userId: user.id,
              reviewId: review.id,
              stance: 'AGREE',
              stanceConfidence: 0.95,
              stanceReasoning: 'Test reasoning for stance detection',
              stanceAnalyzedAt: new Date(),
            },
            select: {
              id: true,
              content: true,
              stance: true,
              stanceConfidence: true,
              stanceReasoning: true,
              stanceAnalyzedAt: true
            }
          });
          
          console.log('✅ Successfully created comment with stance:', newComment);
        } else {
          console.log('❌ No users found in database');
        }
      } else {
        console.log('❌ No reviews found in database');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during stance update test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStanceUpdate();