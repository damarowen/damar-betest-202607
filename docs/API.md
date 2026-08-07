# API Documentation

## Auth Endpoints

### POST /api/auth/login
Generate JWT token.

**Body:**
```json
{
  "userName": "damar",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## User Info Endpoints

All endpoints require `Authorization: Bearer <token>` header.

### GET /api/user-infos
List users with optional filter and sort.

**Query Parameters:**
- `fullName` (string, optional) - Filter by full name (case-insensitive regex)
- `role` (string, optional) - Filter by role
- `sort` (string, optional) - Sort field, prefix with `-` for descending
- `page` (number, optional) - Page number, default 1
- `limit` (number, optional) - Items per page, default 10

### GET /api/user-infos/:userId
Get user detail by userId.

### GET /api/user-infos/account-number/:accountNumber
Get user by accountNumber.

### GET /api/user-infos/registration-number/:registrationNumber
Get user by registrationNumber.

### POST /api/user-infos
Create new user.

**Body:**
```json
{
  "userId": "user-001",
  "fullName": "Damar Owen",
  "accountNumber": "100000001",
  "emailAddress": "damar@example.com",
  "registrationNumber": "REG-2024-0001",
  "role": "admin"
}
```

### PUT /api/user-infos/:userId
Update user.

### DELETE /api/user-infos/:userId
Delete user.

## Account Login Endpoints

All endpoints require `Authorization: Bearer <token>` header.

### GET /api/account-logins
List account logins with filter and sort.

### GET /api/account-logins/inactive
Get account logins with lastLoginDateTime older than 3 days.

### GET /api/account-logins/:accountId
Get account login detail.

### POST /api/account-logins
Create new account login.

**Body:**
```json
{
  "accountId": "acc-001",
  "userName": "damar",
  "password": "password123",
  "userId": "user-001"
}
```

### PUT /api/account-logins/:accountId
Update account login.

### DELETE /api/account-logins/:accountId
Delete account login.
