# Backend API Specification for Admin Dashboard

This document specifies all the API endpoints that need to be implemented in the backend (port 5000) to support the admin dashboard functionality.

## Base URL
```
http://localhost:5000
```

## Authentication
All admin endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Dashboard Endpoints

### GET `/api/admin/dashboard/stats`
Get overview statistics for the dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 1250,
    "fraudulentPosts": 45,
    "totalComments": 8930,
    "negativeComments": 234,
    "activeUsers": 567,
    "flaggedUsers": 12,
    "postsTrend": {
      "direction": "up",
      "percentage": 12
    },
    "fraudTrend": {
      "direction": "down",
      "percentage": 8
    },
    "commentsTrend": {
      "direction": "up",
      "percentage": 15
    },
    "usersTrend": {
      "direction": "up",
      "percentage": 5
    }
  }
}
```

### GET `/api/admin/dashboard/trends?period=7d`
Get trend data for charts.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d) - default: 7d

**Response:**
```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "name": "Mon",
        "posts": 45,
        "fraud": 2,
        "comments": 320,
        "date": "2024-01-15"
      }
    ],
    "sentimentDistribution": {
      "positive": 6500,
      "neutral": 2196,
      "negative": 234
    }
  }
}
```

### GET `/api/admin/dashboard/recent-activity?limit=10`
Get recent platform activities.

**Query Parameters:**
- `limit`: Number of activities to return - default: 10

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_123",
        "type": "fraud",
        "message": "Fraudulent post detected from user @john_doe",
        "time": "2 minutes ago",
        "timestamp": "2024-01-15T10:30:00Z",
        "severity": "high",
        "relatedId": "post_456"
      }
    ]
  }
}
```

---

## 2. Posts Management Endpoints

### GET `/api/admin/posts?page=1&limit=20&status=all&search=`
Get all posts with filtering and pagination.

**Query Parameters:**
- `page`: Page number - default: 1
- `limit`: Items per page - default: 20
- `status`: Filter by status (all, pending, approved, rejected, flagged) - default: all
- `search`: Search in post content or username

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "username": "john_doe",
        "content": "This is a review about the product...",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "flagged",
        "fraudAnalysis": {
          "isFraudulent": true,
          "confidence": 0.85,
          "mlScore": 0.82,
          "ruleScore": 0.88,
          "flags": ["suspicious_pattern", "keyword_match"],
          "analyzedAt": "2024-01-15T10:30:05Z"
        },
        "commentCount": 15,
        "overallSentiment": {
          "score": 0.65,
          "label": "positive"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### GET `/api/admin/posts/:id`
Get detailed information about a specific post.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "username": "john_doe",
    "userId": "user_789",
    "content": "This is a review...",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "flagged",
    "fraudAnalysis": {
      "isFraudulent": true,
      "confidence": 0.85,
      "mlScore": 0.82,
      "ruleScore": 0.88,
      "flags": ["suspicious_pattern"],
      "analyzedAt": "2024-01-15T10:30:05Z"
    },
    "comments": [
      {
        "id": "comment_456",
        "username": "jane_smith",
        "content": "Great review!",
        "sentiment": {
          "score": 0.95,
          "label": "positive"
        },
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

### GET `/api/admin/posts/:id/comments`
Get all comments for a specific post.

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "postId": "post_456",
        "username": "jane_smith",
        "content": "Great review!",
        "sentiment": {
          "score": 0.95,
          "label": "positive"
        },
        "timestamp": "2024-01-15T11:00:00Z",
        "status": "approved"
      }
    ]
  }
}
```

### PATCH `/api/admin/posts/:id/status`
Update the status of a post.

**Request Body:**
```json
{
  "status": "approved",
  "reason": "Verified legitimate review"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post status updated successfully",
  "data": {
    "id": "post_123",
    "status": "approved"
  }
}
```

### POST `/api/admin/posts/:id/reanalyze`
Re-run fraud detection analysis on a post.

**Response:**
```json
{
  "success": true,
  "message": "Post reanalyzed successfully",
  "data": {
    "fraudAnalysis": {
      "isFraudulent": false,
      "confidence": 0.25,
      "mlScore": 0.20,
      "ruleScore": 0.30,
      "flags": [],
      "analyzedAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

### DELETE `/api/admin/posts/:id`
Delete a post.

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## 3. Comments Management Endpoints

### GET `/api/admin/comments?page=1&limit=20&sentiment=all`
Get all comments with filtering.

**Query Parameters:**
- `page`: Page number - default: 1
- `limit`: Items per page - default: 20
- `sentiment`: Filter by sentiment (all, positive, neutral, negative) - default: all

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "postId": "post_456",
        "username": "jane_smith",
        "content": "This is terrible!",
        "sentiment": {
          "score": -0.85,
          "label": "negative",
          "analyzedAt": "2024-01-15T11:00:05Z"
        },
        "timestamp": "2024-01-15T11:00:00Z",
        "status": "approved"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "totalPages": 25
    }
  }
}
```

### GET `/api/admin/comments/:id`
Get detailed information about a specific comment.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment_123",
    "postId": "post_456",
    "userId": "user_789",
    "username": "jane_smith",
    "content": "This is terrible!",
    "sentiment": {
      "score": -0.85,
      "label": "negative",
      "analyzedAt": "2024-01-15T11:00:05Z"
    },
    "timestamp": "2024-01-15T11:00:00Z",
    "status": "approved"
  }
}
```

### PATCH `/api/admin/comments/:id/status`
Update the status of a comment.

**Request Body:**
```json
{
  "status": "hidden",
  "reason": "Inappropriate content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment status updated successfully"
}
```

### POST `/api/admin/comments/:id/reanalyze`
Re-run sentiment analysis on a comment.

**Response:**
```json
{
  "success": true,
  "message": "Comment reanalyzed successfully",
  "data": {
    "sentiment": {
      "score": -0.65,
      "label": "negative",
      "analyzedAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

### DELETE `/api/admin/comments/:id`
Delete a comment.

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 4. User Management Endpoints

### GET `/api/admin/users?page=1&limit=20&status=all&search=`
Get all users with filtering.

**Query Parameters:**
- `page`: Page number - default: 1
- `limit`: Items per page - default: 20
- `status`: Filter by status (all, active, suspended, banned, flagged) - default: all
- `search`: Search by username or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "username": "john_doe",
        "email": "john@example.com",
        "joinedDate": "2023-06-15T10:00:00Z",
        "status": "active",
        "postCount": 25,
        "commentCount": 156,
        "fraudulentPostCount": 2,
        "riskLevel": "medium",
        "lastActivity": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 567,
      "totalPages": 29
    }
  }
}
```

### GET `/api/admin/users/:id`
Get detailed information about a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "john_doe",
    "email": "john@example.com",
    "joinedDate": "2023-06-15T10:00:00Z",
    "status": "active",
    "postCount": 25,
    "commentCount": 156,
    "fraudulentPostCount": 2,
    "riskLevel": "medium",
    "lastActivity": "2024-01-15T10:30:00Z",
    "recentPosts": [
      {
        "id": "post_456",
        "content": "Recent post...",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "approved"
      }
    ]
  }
}
```

### GET `/api/admin/users/:id/posts`
Get all posts by a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "content": "Post content...",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "approved",
        "fraudAnalysis": {
          "isFraudulent": false,
          "confidence": 0.15
        }
      }
    ]
  }
}
```

### GET `/api/admin/users/:id/activity`
Get activity history for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_123",
        "type": "post_created",
        "description": "Created a new post",
        "timestamp": "2024-01-15T10:30:00Z",
        "relatedId": "post_456"
      }
    ]
  }
}
```

### PATCH `/api/admin/users/:id/status`
Update user status.

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Repeated fraudulent posts",
  "duration": "7d"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

### POST `/api/admin/users/:id/suspend`
Suspend a user temporarily.

**Request Body:**
```json
{
  "reason": "Suspicious activity",
  "duration": "7d"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "suspendedUntil": "2024-01-22T10:30:00Z"
  }
}
```

### POST `/api/admin/users/:id/ban`
Permanently ban a user.

**Request Body:**
```json
{
  "reason": "Repeated violations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User banned successfully"
}
```

### POST `/api/admin/users/:id/reactivate`
Reactivate a suspended or banned user.

**Request Body:**
```json
{
  "reason": "Appeal accepted"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User reactivated successfully"
}
```

---

## 5. Analytics Endpoints

### GET `/api/admin/analytics/fraud?period=7d`
Get fraud detection analytics.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d) - default: 7d

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAnalyzed": 1250,
    "fraudDetected": 45,
    "detectionRate": 3.6,
    "byMethod": {
      "mlOnly": 15,
      "ruleOnly": 10,
      "both": 20
    },
    "byDay": [
      {
        "date": "2024-01-15",
        "total": 180,
        "fraud": 7
      }
    ],
    "topFlags": [
      {
        "flag": "suspicious_pattern",
        "count": 25
      }
    ]
  }
}
```

### GET `/api/admin/analytics/sentiment?period=7d`
Get sentiment analysis analytics.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d) - default: 7d

**Response:**
```json
{
  "success": true,
  "data": {
    "totalComments": 8930,
    "distribution": {
      "positive": 6500,
      "neutral": 2196,
      "negative": 234
    },
    "averageScore": 0.65,
    "trend": "improving",
    "byDay": [
      {
        "date": "2024-01-15",
        "positive": 920,
        "neutral": 310,
        "negative": 35
      }
    ]
  }
}
```

### GET `/api/admin/analytics/users?period=7d`
Get user analytics.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d) - default: 7d

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 567,
    "activeUsers": 234,
    "newUsers": 45,
    "flaggedUsers": 12,
    "byRiskLevel": {
      "low": 450,
      "medium": 95,
      "high": 22
    },
    "engagement": {
      "avgPostsPerUser": 4.2,
      "avgCommentsPerUser": 15.8
    }
  }
}
```

---

## 6. Settings Endpoints

### GET `/api/admin/settings`
Get all system settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "fraud": {
      "mlThreshold": 0.7,
      "ruleThreshold": 0.8,
      "autoFlag": true,
      "autoReject": false
    },
    "sentiment": {
      "negativeThreshold": -0.5,
      "autoHide": false
    },
    "notifications": {
      "email": true,
      "slack": false
    }
  }
}
```

### PATCH `/api/admin/settings`
Update system settings.

**Request Body:**
```json
{
  "fraud": {
    "mlThreshold": 0.65,
    "autoFlag": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### GET `/api/admin/settings/fraud-thresholds`
Get fraud detection thresholds.

**Response:**
```json
{
  "success": true,
  "data": {
    "mlThreshold": 0.7,
    "ruleThreshold": 0.8,
    "combinedThreshold": 0.75
  }
}
```

### PATCH `/api/admin/settings/fraud-thresholds`
Update fraud detection thresholds.

**Request Body:**
```json
{
  "mlThreshold": 0.65,
  "ruleThreshold": 0.75,
  "combinedThreshold": 0.70
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fraud thresholds updated successfully"
}
```

---

## Error Responses

All endpoints should return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "status",
      "issue": "Invalid status value"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Integration with ML Services

The backend should integrate with the three ML services running locally:

1. **Rule-Based Fraud Detection** (Port 8001)
   - Called when a post is submitted
   - Results stored in MongoDB with the post

2. **ML-Based Fraud Detection** (Port 8002)
   - Called when a post is submitted
   - Results stored in MongoDB with the post

3. **Sentiment Analysis** (Port 8003)
   - Called when a comment is submitted
   - Results stored in MongoDB with the comment

---

## Database Schema Considerations

### Posts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  content: String,
  timestamp: Date,
  status: String, // 'pending', 'approved', 'rejected', 'flagged'
  fraudAnalysis: {
    isFraudulent: Boolean,
    confidence: Number,
    mlScore: Number,
    ruleScore: Number,
    flags: [String],
    analyzedAt: Date
  },
  commentCount: Number,
  overallSentiment: {
    score: Number,
    label: String
  }
}
```

### Comments Collection
```javascript
{
  _id: ObjectId,
  postId: ObjectId,
  userId: ObjectId,
  username: String,
  content: String,
  timestamp: Date,
  status: String, // 'approved', 'hidden'
  sentiment: {
    score: Number,
    label: String, // 'positive', 'neutral', 'negative'
    analyzedAt: Date
  }
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  joinedDate: Date,
  status: String, // 'active', 'suspended', 'banned'
  postCount: Number,
  commentCount: Number,
  fraudulentPostCount: Number,
  riskLevel: String, // 'low', 'medium', 'high'
  lastActivity: Date,
  suspendedUntil: Date,
  banReason: String
}
```

---

## Testing

Use the provided test script to verify endpoints:
```bash
# From frontend directory
npm run test-api
```

Or manually test with curl:
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes for Implementation

1. **Authentication**: Implement JWT-based authentication for all admin endpoints
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **Caching**: Cache dashboard statistics for better performance
4. **Real-time Updates**: Consider implementing WebSocket for real-time dashboard updates
5. **Pagination**: All list endpoints should support pagination
6. **Filtering**: Implement flexible filtering options for better admin experience
7. **Logging**: Log all admin actions for audit trail
8. **Validation**: Validate all input data before processing
9. **CORS**: Configure CORS to allow frontend access from http://localhost:5173

---

## Integration Timeline

1. **Phase 1**: Implement authentication and basic CRUD endpoints
2. **Phase 2**: Integrate with ML services and implement analysis features
3. **Phase 3**: Add analytics and reporting endpoints
4. **Phase 4**: Implement real-time updates and advanced features

