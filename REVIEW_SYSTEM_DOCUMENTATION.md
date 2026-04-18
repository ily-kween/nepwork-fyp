# Rating & Review System Documentation

## Overview
A complete rating and review system for freelancing platforms where clients can rate and review freelancers after project completion. The system builds trust through verified feedback and provides valuable insights for both clients and freelancers.

## System Architecture

### Backend Components

#### 1. Review Model (`/server/src/models/review.model.js`)
```javascript
{
  project_id: ObjectId (ref: Job),
  client_id: ObjectId (ref: User),
  freelancer_id: ObjectId (ref: User),
  rating: Number (1-5),
  review_text: String (optional),
  isApproved: Boolean (default: true),
  timestamps: { createdAt, updatedAt }
}
```

**Unique Constraint:** Only one review per project

#### 2. API Endpoints

**Create Review**
```
POST /api/v1/reviews/submit
Headers: Authorization: Bearer {token}
Body: {
  project_id: String,
  rating: Number (1-5),
  review_text: String (optional)
}
Response: {
  review: { _id, project_id, client_id, freelancer_id, rating, review_text, createdAt },
  message: "Review created successfully"
}
```

**Get Freelancer Reviews**
```
GET /api/v1/reviews/freelancer/{freelancerId}?sort=latest&page=1&limit=10
Query Parameters:
  - sort: "latest" | "highest" | "lowest" (default: latest)
  - page: Number (default: 1)
  - limit: Number (default: 10)

Response: {
  reviews: Array,
  totalReviews: Number,
  totalPages: Number,
  currentPage: Number,
  ratingBreakdown: { 5: Number, 4: Number, 3: Number, 2: Number, 1: Number }
}
```

**Get Freelancer Rating**
```
GET /api/v1/reviews/rating/{freelancerId}
Response: {
  averageRating: Number (0.0 - 5.0),
  totalReviews: Number
}
```

**Check Review Status**
```
GET /api/v1/reviews/check/{projectId}
Headers: Authorization: Bearer {token}
Response: {
  canReview: Boolean,
  isCompleted: Boolean,
  hasReview: Boolean,
  freelancer: ObjectId
}
```

### Frontend Components

#### 1. ReviewModal Component
Location: `/client/src/components/ReviewModal.jsx`

**Purpose:** Modal form for clients to submit reviews
**Features:**
- 1-5 star rating picker with hover preview
- Optional review text (max 500 characters)
- Character counter
- Form validation
- Loading state

**Props:**
```javascript
{
  projectId: String (required),
  freelancerId: String,
  onClose: Function,
  onSuccess: Function
}
```

#### 2. ReviewsDisplay Component
Location: `/client/src/components/ReviewsDisplay.jsx`

**Purpose:** Display all reviews for a freelancer on their profile
**Features:**
- Average rating display with visual representation
- Rating breakdown (5★, 4★, 3★, 2★, 1★ counts)
- Sortable review list (latest, highest, lowest)
- Review cards with client info, date, rating, comment
- Expandable comments for longer reviews
- No reviews state

**Props:**
```javascript
{
  freelancerId: String (required)
}
```

#### 3. ReviewButton Component
Location: `/client/src/components/ReviewButton.jsx`

**Purpose:** Quick review action button in project lists
**Features:**
- Shows "Give Review" button when project is completed
- Shows "Review submitted" message after review created
- Loads ReviewModal on click
- Checks if review can be given
- Prevents duplicate reviews

**Props:**
```javascript
{
  projectId: String (required),
  onReviewSubmitted: Function (optional)
}
```

### Integration Points

#### 1. Freelancer Profile Page
Location: `/client/src/pages/Profile.jsx`

Added ReviewsDisplay component to show all reviews when viewing a freelancer's profile:
```jsx
{!isClient && currentProfileData?.role === "freelancer" && (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <ReviewsDisplay freelancerId={currentProfileData?._id} />
  </div>
)}
```

#### 2. Project Workspace Page
Location: `/client/src/pages/ProjectWorkspace.jsx`

Added ReviewButton next to completed projects to allow clients to leave reviews:
```jsx
{["completed", "paid"].includes(project.status) && (
  <ReviewButton
    projectId={project._id}
    onReviewSubmitted={() => {
      // Optionally refresh projects
    }}
  />
)}
```

## Workflow

### Client Review Process
1. **Project Completion**: Project status changes to "completed"
2. **Review Availability**: "Give Review" button appears in ProjectWorkspace
3. **Review Submission**: Client clicks button → ReviewModal opens
4. **Fill Details**: Client selects rating (1-5) and optionally writes comment
5. **Validation**: Form validates rating is selected
6. **Submit**: Review is sent to backend via POST /reviews/submit
7. **Success**: Button changes to "Review submitted" state

### Freelancer Profile Journey
1. **Visit Profile**: Client visits freelancer's profile
2. **View Reviews**: ReviewsDisplay component loads
3. **Rating Summary**: Shows average rating with breakdown
4. **Browse Reviews**: Scroll through all reviews with filters
5. **Sort Options**: Can sort by latest, highest, or lowest rating

## Validation Rules

### Backend Validation
- ✅ Only project owner (client) can review
- ✅ Project must be in "completed" status
- ✅ Rating must be 1-5
- ✅ Only one review per project (unique index)
- ✅ Client and freelancer IDs must be valid
- ✅ Project must have accepted freelancer

### Frontend Validation
- ✅ Rating selection required before submit
- ✅ Character limit enforced (500 max)
- ✅ Prevent duplicate submissions
- ✅ Check review status before allowing new review

## Data Security

### Access Control
- `POST /reviews/submit`: Requires authentication, verifies client ownership
- `GET /reviews/freelancer/:id`: Public (no auth needed)
- `GET /reviews/rating/:id`: Public (no auth needed)
- `GET /reviews/check/:id`: Requires authentication, verifies client ownership

### Data Validation
- All inputs validated on both client and server
- SQL injection prevention via Mongoose schemas
- XSS prevention through React's automatic escaping
- Rate limiting on API endpoints (implement as needed)

## Features

### Current Implementation
✅ 1-5 star rating system
✅ Optional review text (max 500 chars)
✅ One review per project constraint
✅ Average rating calculation
✅ Rating breakdown visualization
✅ Review sorting (latest, highest, lowest)
✅ Pagination support
✅ Client info display on reviews
✅ Project title in review context
✅ Timestamp tracking

### Optional Enhancements
- [ ] Freelancer response to reviews
- [ ] Review upvoting/helpfulness rating
- [ ] Review moderation/flagging system
- [ ] Review filtering by rating
- [ ] Review verification badge
- [ ] Question-answer system on reviews
- [ ] Review analytics dashboard
- [ ] Email notifications for new reviews
- [ ] Review templates/guidance

## Testing

### API Testing (Postman/cURL)

**Create Review:**
```bash
curl -X POST http://localhost:3000/api/v1/reviews/submit \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "projectId123",
    "rating": 5,
    "review_text": "Excellent work!"
  }'
```

**Get Reviews:**
```bash
curl http://localhost:3000/api/v1/reviews/freelancer/freelancerId123?sort=latest
```

**Get Rating:**
```bash
curl http://localhost:3000/api/v1/reviews/rating/freelancerId123
```

**Check Review Status:**
```bash
curl http://localhost:3000/api/v1/reviews/check/projectId123 \
  -H "Authorization: Bearer {token}"
```

### Scenarios to Test
1. ✅ Submit review for completed project
2. ✅ Prevent review for non-completed project
3. ✅ Prevent duplicate review on same project
4. ✅ Verify only client can review
5. ✅ Calculate average rating correctly
6. ✅ Display reviews on freelancer profile
7. ✅ Sort reviews (latest, highest, lowest)
8. ✅ Handle empty review text (optional field)

## Database Queries

### Useful Aggregations

**Get Average Rating with Count:**
```javascript
db.reviews.aggregate([
  { $match: { freelancer_id: ObjectId("...") } },
  { $group: {
      _id: "$freelancer_id",
      averageRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 }
    }
  }
])
```

**Get Rating Distribution:**
```javascript
db.reviews.aggregate([
  { $match: { freelancer_id: ObjectId("...") } },
  { $group: {
      _id: "$rating",
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: -1 } }
])
```

## Performance Optimization

### Indexing
- `project_id`: Unique index (prevents duplicates)
- `freelancer_id`: Index (fast freelancer lookup)
- `client_id`: Index (fast client lookup)
- `createdAt`: Index (faster sorting/filtering)

### Query Optimization
- Pagination: Limit results to 10 per page
- Selection: Only fetch needed fields
- Caching: Can cache average ratings (5-10 min TTL)
- Sorting: Use indexed fields for better performance

## Error Handling

### Common Errors
1. **400 Bad Request**: Missing required fields
2. **403 Forbidden**: Unauthorized to review (not client)
3. **404 Not Found**: Project or freelancer doesn't exist
4. **409 Conflict**: Review already exists for project
5. **422 Unprocessable**: Invalid rating value

### User-Friendly Messages
- "Project must be completed before reviewing"
- "Review already submitted for this project"
- "Only project owner can leave a review"
- "Rating must be between 1 and 5"

## Monitoring & Analytics

### Metrics to Track
- Average rating across platform
- Total reviews submitted
- Reviews per freelancer (avg)
- Rating distribution
- Review submission rate (%)
- Reviews per day/week/month

### Future Enhancements
- Review sentiment analysis
- Spam/fraud detection
- Rating trends over time
- Top/bottom rated freelancers
- Review velocity alerts

## Compliance & Best Practices

### GDPR Considerations
- Reviews tied to user accounts (no anonymous)
- Ability to request review data export
- Consider review deletion/anonymization policies

### Content Moderation
- Flag inappropriate content
- Auto-moderate spam patterns
- Manual review reporting system

### Incentives
- Encourage balanced feedback
- Display review count prominently
- Reward helpful reviews (future)

## Support & Troubleshooting

### Common Issues

**Q: ReviewButton not showing**
A: Check if project status is "completed" or "paid"

**Q: Can't submit review**
A: Verify you're logged in and are the project owner

**Q: Reviews not loading**
A: Check API endpoint is correct (/api/v1/reviews/freelancer/{id})

**Q: Rating not calculating**
A: Ensure reviews exist for freelancer; refresh page

## Files Created/Modified

### New Files
- `/server/src/models/review.model.js`
- `/server/src/controllers/review/createReview.controller.js`
- `/server/src/controllers/review/getFreelancerReviews.controller.js`
- `/server/src/controllers/review/getFreelancerRating.controller.js`
- `/server/src/controllers/review/checkReviewStatus.controller.js`
- `/server/src/controllers/review/index.js`
- `/server/src/routes/review.route.js`
- `/client/src/components/ReviewModal.jsx`
- `/client/src/components/ReviewsDisplay.jsx`
- `/client/src/components/ReviewButton.jsx`

### Modified Files
- `/server/src/models/index.js` (added Review export)
- `/server/src/controllers/index.js` (added review controllers)
- `/server/src/app.js` (added review routes)
- `/client/src/components/index.js` (added review components)
- `/client/src/pages/Profile.jsx` (added ReviewsDisplay)
- `/client/src/pages/ProjectWorkspace.jsx` (added ReviewButton)

## Version History

- **v1.0** (04/15/2026): Initial release with core review functionality
  - Star rating system
  - Review text field
  - Average rating calculation
  - Review display and sorting
  - Freelancer profile integration
  - Project workspace integration

---

**Last Updated:** April 15, 2026
**Author:** Development Team
