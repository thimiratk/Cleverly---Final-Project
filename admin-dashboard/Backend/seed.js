require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Review = require('./models/Review');
const Badge = require('./models/Badge');
const FraudReport = require('./models/FraudReport');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Review.deleteMany({});
    await Badge.deleteMany({});
    await FraudReport.deleteMany({});

    // Create sample badges
    const badges = await Badge.insertMany([
      {
        name: 'Trusted Reviewer',
        description: 'Awarded to reviewers with consistently high-quality, verified reviews',
        criteria: 'High-quality reviews',
        icon: 'Shield',
        color: 'blue',
        requirements: ['50+ verified reviews', '90%+ accuracy rate', 'Account age > 6 months'],
        holders: 0,
        active: true
      },
      {
        name: 'Expert Reviewer',
        description: 'Top-tier badge for domain experts with exceptional review quality',
        criteria: 'Expert verification',
        icon: 'Crown',
        color: 'purple',
        requirements: ['100+ verified reviews', '95%+ accuracy rate', 'Expert verification'],
        holders: 0,
        active: true
      },
      {
        name: 'Verified Purchaser',
        description: 'Confirms the reviewer has purchased the reviewed product',
        criteria: 'Purchase verification',
        icon: 'CheckCircle',
        color: 'green',
        requirements: ['Purchase verification', 'Valid receipt'],
        holders: 0,
        active: true
      },
      {
        name: 'Community Helper',
        description: 'For users who actively help moderate and improve the community',
        criteria: 'Community engagement',
        icon: 'Users',
        color: 'orange',
        requirements: ['Helpful reviews rating > 80%', 'Community engagement'],
        holders: 0,
        active: true
      }
    ]);

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'reviewer',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        trustScore: 85,
        reviewCount: 23,
        badges: [badges[0]._id, badges[2]._id]
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'reviewer',
        phone: '+1 (555) 987-6543',
        location: 'Los Angeles, CA',
        trustScore: 92,
        reviewCount: 45,
        badges: [badges[0]._id, badges[1]._id, badges[2]._id]
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        phone: '+1 (555) 456-7890',
        location: 'Chicago, IL',
        department: 'Content Moderation',
        trustScore: 78,
        reviewCount: 12
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@cleverly.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        phone: '+1 (555) 123-4567',
        location: 'Seattle, WA',
        department: 'Trust & Safety',
        bio: 'Senior administrator overseeing review authenticity, user verification, and platform integrity.',
        permissions: ['Review Verification', 'Badge Management', 'User Authentication', 'Content Moderation'],
        trustScore: 100,
        reviewCount: 5
      }
    ]);

    // Create sample reviews
    const reviews = await Review.insertMany([
      {
        author: users[0]._id,
        content: 'Amazing product! The quality exceeded my expectations. Fast shipping and great customer service.',
        product: 'iPhone 15 Pro',
        category: 'Electronics',
        rating: 5,
        status: 'published',
        verificationStatus: 'verified',
        helpfulVotes: 15,
        sentiment: 'positive'
      },
      {
        author: users[1]._id,
        content: 'Good value for money. Some minor issues but overall satisfied with the purchase.',
        product: 'Samsung Galaxy Watch',
        category: 'Electronics',
        rating: 4,
        status: 'published',
        verificationStatus: 'verified',
        helpfulVotes: 8,
        sentiment: 'positive'
      },
      {
        author: users[0]._id,
        content: 'Not as described. Poor quality materials and delayed shipping.',
        product: 'Wireless Headphones',
        category: 'Electronics',
        rating: 2,
        status: 'published',
        verificationStatus: 'verified',
        helpfulVotes: 3,
        sentiment: 'negative'
      },
      {
        author: users[1]._id,
        content: 'Perfect fit and great design. Highly recommended!',
        product: 'Running Shoes',
        category: 'Sports',
        rating: 5,
        status: 'pending',
        verificationStatus: 'unverified',
        helpfulVotes: 0,
        sentiment: 'positive'
      }
    ]);

    // Create sample fraud reports
    await FraudReport.insertMany([
      {
        type: 'Review Farm',
        description: 'Coordinated fake reviews from multiple accounts',
        riskScore: 9.7,
        status: 'confirmed',
        detectedBy: 'ML Network Analysis',
        affectedReviews: 23,
        timestamp: new Date(),
        evidence: ['Same IP address range', 'Similar writing patterns', 'Coordinated posting times']
      },
      {
        type: 'Sentiment Manipulation',
        description: 'Artificially inflated positive ratings',
        riskScore: 8.4,
        status: 'investigating',
        detectedBy: 'Sentiment AI Model',
        affectedReviews: 15,
        timestamp: new Date(),
        evidence: ['Unusual sentiment spike', 'Generic positive language', 'Rating vs text mismatch']
      }
    ]);

    // Update badge holder counts
    for (let badge of badges) {
      const holderCount = await User.countDocuments({ badges: badge._id });
      badge.holders = holderCount;
      await badge.save();
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${reviews.length} reviews`);
    console.log(`Created ${badges.length} badges`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
