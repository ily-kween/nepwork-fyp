# Nepwork Server API Documentation

This document outlines all the available API endpoints for the Nepwork server, a platform for freelancers and clients to connect, manage jobs, and handle transactions.

## Base URL
All API endpoints are prefixed with `/api/v1/`.

## Authentication
Most endpoints require authentication via JWT tokens. Include the token in cookies or Authorization header.

## Endpoints

### Root
- **GET /** - Health check, returns "This is nepwork server"

### Tags
- **GET /tags** - Get available tags

### User Management (`/user`)

#### Authentication
- **POST /user/signup** - Register a new user
- **POST /user/login** - Login user (case-insensitive password)
- **POST /user/refresh-access-token** - Refresh access token
- **GET /user/verify-token** - Verify user token
- **POST /user/request-otp** - Request OTP (authenticated)
- **POST /user/verify-email** - Verify email (authenticated)

#### Profile
- **GET /user/current-user-info** - Get current user info (authenticated)
- **POST /user/switch-role** - Switch user role (authenticated, verified)
- **POST /user/update-avatar** - Update avatar (authenticated, file upload)
- **POST /user/update-profile-tags** - Update profile tags (authenticated)
- **POST /user/update-about** - Update about section (authenticated)
- **POST /user/update-hourly-rate** - Update hourly rate (authenticated)
- **GET /user/profiles/:userId** - Get user profile data

#### Social
- **POST /user/:targetId/follow** - Follow a user (authenticated)
- **POST /user/:targetId/unfollow** - Unfollow a user (authenticated)
- **GET /user/followers/:targetId** - Get followers
- **GET /user/following/:targetId** - Get following

#### KYC
- **POST /user/upload-kyc** - Upload KYC document (authenticated, file upload)

#### Freelancers
- **GET /user/get-freelancers** - Get list of freelancers

#### Transactions
- **GET /user/transactions/all** - Get all transactions (authenticated)
- **GET /user/transactions/recent** - Get recent transactions (authenticated)
- **GET /user/transactions/:tId** - Get single transaction (authenticated)

### Admin (`/admin`)
- **POST /admin/create-admin** - Create admin user
- **POST /admin/login** - Admin login (case-insensitive password)
- **GET /admin/verify-token** - Verify admin token (authenticated, admin only)

### KYC (`/kyc`)
- **GET /kyc/get-all-kyc** - Get all KYC submissions (authenticated, admin)
- **GET /kyc/get-kyc/:id** - Get KYC by ID (authenticated, admin)
- **POST /kyc/update-status/:id** - Update KYC status (authenticated, admin)

### Jobs (`/jobs`)
- **POST /jobs/create-job** - Create a job (authenticated, verified, client)
- **POST /jobs/update-job** - Update a job (authenticated, verified, client)
- **GET /jobs/get-jobs-posted-by-current-user** - Get jobs posted by current user (authenticated, client)
- **DELETE /jobs/delete-job/:jobId** - Delete a job (authenticated, client)
- **GET /jobs/get-home-jobs** - Get home page jobs
- **GET /jobs/:id** - Get single job
- **POST /jobs/apply** - Apply for a job (authenticated, verified, freelancer)
- **GET /jobs/applicants/:jobId** - Get job applicants
- **POST /jobs/:jobId/accept-freelancer** - Accept freelancer for job (authenticated, client)
- **GET /jobs/:userId/open-jobs** - Get open jobs for user
- **GET /jobs/overview/:jobId** - Get job overview (authenticated)
- **GET /jobs/transaction/:jobId** - Get transaction for job (authenticated)
- **POST /jobs/transaction/:tId/pay** - Pay transaction (authenticated)

### Chat (`/chats`)
- **GET /chats/** - Get chats (authenticated)
- **GET /chats/get-connections** - Get connections (authenticated)
- **POST /chats/create-chat** - Create a chat (authenticated)
- **POST /chats/:chatId/new-message** - Send new message (authenticated)
- **DELETE /chats/delete/:chatId** - Delete chat (authenticated)

## Real-time Features
The server uses Socket.IO for real-time communication:
- User online/offline status
- Chat messages (likely handled via WebSockets)

## What You Can Do With This API

### For Users:
- Register and login (case-insensitive passwords)
- Manage profile (avatar, tags, about, hourly rate)
- Switch between client/freelancer roles
- Upload KYC documents
- Follow/unfollow other users
- View freelancers list
- View transactions

### For Clients:
- Post jobs
- Update/delete their jobs
- View applicants for their jobs
- Accept freelancers
- Pay for completed work
- View job overviews and transactions

### For Freelancers:
- Apply for jobs
- View open jobs
- Manage profile

### For Admins:
- Login
- Manage KYC submissions (view and update status)
- Create other admins

### General:
- Chat with connections
- Real-time messaging
- View tags
- Refresh tokens

This API powers a freelance marketplace where clients can post jobs, freelancers can apply, and admins manage verifications.</content>
<parameter name="filePath">e:\Asg\Nepwork\server\API_DOCUMENTATION.md