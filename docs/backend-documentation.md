# CannapurePlus Backend Documentation

## Overview

This document provides a comprehensive overview of the CannapurePlus backend system, including its architecture, API endpoints, database structure, and implementation details. It serves as a reference for developers working on the system and a guide for future enhancements.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Structure](#database-structure)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Data Freshness Strategy](#data-freshness-strategy)
6. [Implementation Status](#implementation-status)
7. [Future Enhancements](#future-enhancements)

## System Architecture

The CannapurePlus backend is built using:
- **Node.js** with **Express.js** framework
- **MySQL** database with **mysql2** driver
- RESTful API architecture
- JWT-based authentication (planned)

The system follows a modular architecture with the following components:
- **Server**: Main Express application setup
- **Database**: Connection pool and query management
- **API Routes**: Endpoint definitions and request handling
- **Services**: Business logic and database operations
- **Middleware**: Authentication, logging, and error handling

## Database Structure

### Product Tables

The database includes multiple tables for different types of cannabis products:

| Table Name | Description | Sample Fields |
|------------|-------------|--------------|
| `medical_strains` | Therapeutic strains with high CBD | strain_name, strain_type, price, thc, description |
| `normal_strains` | Standard cannabis strains | strain_name, strain_type, price, thc |
| `greenhouse_strains` | Greenhouse-grown strains | strain_name, strain_type, price, thc |
| `indoor_strains` | Indoor-grown premium strains | strain_name, strain_type, price, thc |
| `exotic_tunnel_strains` | Premium exotic strains | strain_name, strain_type, price, thc |
| `edibles` | Edible cannabis products | strain_name, price, thc, description |
| `extracts_vapes` | Concentrates and vape products | strain_name, price, thc, description |
| `pre_rolled` | Pre-rolled joints | strain_name, price, thc, description |

Each table has a similar structure with fields for product details, pricing, and characteristics.

### Authentication Tables

#### Users Table

The `users` table stores comprehensive user information including authentication credentials, personal details, and membership status:

| Column | Type | Description |
|--------|------|-------------|
| id | int(11) | Primary key, auto-increment |
| id_number | varchar(13) | Unique national ID number |
| first_name | varchar(50) | User's first name |
| last_name | varchar(255) | User's last name |
| surname | varchar(50) | User's surname |
| email | varchar(100) | Unique email address for login |
| phone_number | varchar(20) | Contact phone number |
| address | text | Physical address |
| password | varchar(255) | Bcrypt hashed password |
| cpNumber | varchar(50) | Unique cannabis permit number |
| cp_issued_date | timestamp | Date when cannabis permit was issued |
| cp_status | enum | 'ACTIVE', 'SUSPENDED', 'REVOKED' |
| account_status | enum | 'PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED' |
| last_login | timestamp | Last successful login timestamp |
| created_at | timestamp | Account creation timestamp |
| updated_at | timestamp | Last update timestamp |
| reset_token | varchar(255) | Password reset token |
| reset_token_expires | timestamp | Expiration for reset token |
| modified_by | int(11) | ID of admin who modified the account |
| modification_reason | text | Reason for account modification |
| last_login_attempt | timestamp | Last login attempt timestamp |
| failed_login_attempts | int(11) | Count of failed login attempts |
| last_login_ip | varchar(45) | IP address of last login |
| device_fingerprint | text | Device information |
| is_locked | tinyint(1) | Whether account is locked |
| lock_reason | text | Reason for account lock |
| lock_expires_at | timestamp | When account lock expires |
| membership_tier | enum | 'GOLD', 'DIAMOND', 'EMERALD', 'TROPEZ', 'BASIC' |
| membership_start_date | timestamp | When membership started |
| active_days | int(11) | Days user has been active |
| days_to_next_tier | int(11) | Days until next membership tier |
| last_active_date | timestamp | Last activity date |
| tier_updated_at | timestamp | When membership tier was updated |
| membership_status | enum | 'ACTIVE', 'PAUSED', 'EXPIRED' |
| pause_date | timestamp | When membership was paused |
| total_pause_days | int(11) | Total days membership has been paused |

#### User Sessions Table

The `user_sessions` table tracks active user sessions for authentication management:

| Column | Type | Description |
|--------|------|-------------|
| id | int(11) | Primary key, auto-increment |
| user_id | int(11) | Foreign key to users table |
| session_token | varchar(255) | Unique session identifier |
| device_info | text | Information about user's device |
| ip_address | varchar(45) | IP address of the session |
| created_at | timestamp | When session was created |
| expires_at | timestamp | When session expires |
| is_valid | tinyint(1) | Whether session is still valid |

#### Login Attempts Table

The `login_attempts` table records login attempts for security monitoring and rate limiting:

| Column | Type | Description |
|--------|------|-------------|
| id | int(11) | Primary key, auto-increment |
| user_id | int(11) | Foreign key to users table (can be NULL) |
| email | varchar(100) | Email used in login attempt |
| ip_address | varchar(45) | IP address of login attempt |
| attempt_time | timestamp | When attempt occurred |
| success | tinyint(1) | Whether attempt was successful |
| attempt_details | text | Additional details about attempt |

#### User Activity Logs Table

The `user_activity_logs` table tracks user activities for auditing and security:

| Column | Type | Description |
|--------|------|-------------|
| id | int(11) | Primary key, auto-increment |
| user_id | int(11) | Foreign key to users table |
| activity_type | varchar(50) | Type of activity |
| ip_address | varchar(45) | IP address of activity |
| device_info | text | Information about user's device |
| activity_details | text | Details about the activity |
| created_at | timestamp | When activity occurred |

## API Endpoints

### Strains API

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/strains` | GET | Get all strains from all categories | limit, offset, sortBy, sortDir |
| `/api/strains/:type` | GET | Get strains of a specific type | type, limit, offset, minPrice, maxPrice, location, sortBy, sortDir |
| `/api/strains/:type/:id` | GET | Get a specific strain by ID | type, id |
| `/api/strains/:type/cannabis/:cannabisType` | GET | Get strains by cannabis type | type, cannabisType (Indica, Sativa, Hybrid) |
| `/api/strains/:type/location/:location` | GET | Get strains by location | type, location |
| `/api/strains/:type/specials` | GET | Get special strains | type |
| `/api/strains/medical/cbd/:minCbd` | GET | Get medical strains by CBD content | minCbd |
| `/api/strains/medical/condition/:condition` | GET | Get medical strains by condition | condition |

### Authentication API

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/auth/register` | POST | Register a new user | email, password, first_name, last_name, id_number, phone_number |
| `/api/auth/login` | POST | Authenticate a user | email, password |
| `/api/auth/refresh` | POST | Refresh an access token | refreshToken |
| `/api/auth/logout` | POST | Invalidate tokens | refreshToken |
| `/api/auth/profile` | GET | Get user profile | - |
| `/api/auth/profile` | PUT | Update user profile | first_name, last_name, phone_number, address |
| `/api/auth/reset-password` | POST | Request password reset | email |
| `/api/auth/reset-password/:token` | PUT | Reset password with token | password, confirmPassword |

### Cache Dashboard API

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/cache/stats` | GET | Get cache statistics | includeHistory, historyLimit |
| `/api/cache/keys` | GET | Get cache keys | pattern, limit, offset |
| `/api/cache/keys/:key` | GET | Get cache key details | key, namespace |
| `/api/cache/clear` | POST | Clear cache | pattern, namespace |
| `/api/cache/export` | POST | Export cache statistics | filePath |
| `/api/cache/jobs` | GET | Get background refresh jobs | - |
| `/api/cache/jobs` | POST | Start a background refresh job | key, namespace, cronExpression, ttl, fetchFunction |
| `/api/cache/jobs/:jobId` | DELETE | Stop a background refresh job | jobId |
| `/api/cache/refresh` | POST | Manually trigger a cache refresh | key, namespace |

### Utility Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint with cache statistics and data freshness information |
| `/api/test` | GET | Test endpoint |

## Authentication

Authentication is implemented using JWT (JSON Web Tokens):

### Authentication Endpoints

The system provides comprehensive authentication endpoints for user management:
- Registration with validation
- Login with security measures
- Token refresh mechanism
- Secure logout
- Profile management
- Password reset flow

### Authentication Middleware

The authentication middleware validates JWT tokens and protects routes:

```javascript
// Example usage of auth middleware
app.use('/api/protected-route', 
  authMiddleware.verifyToken,
  protectedRoutes
);

// Role-based access control
app.use('/api/admin', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole('admin'),
  adminRoutes
);
```

### Token Management

The system uses two types of tokens:
- **Access Token**: Short-lived token (15-60 minutes) for API access
- **Refresh Token**: Long-lived token (7-30 days) for obtaining new access tokens

### Security Features

- Password hashing with bcrypt
- Token expiration and rotation
- CSRF protection
- Rate limiting for login attempts
- Secure HTTP-only cookies for refresh tokens
- XSS protection
- Account locking after failed attempts
- Activity logging for security auditing

### User Roles and Permissions

The system supports role-based access control:
- **User**: Basic access to user-specific features
- **Member**: Access to membership features
- **Admin**: Full access to administrative functions

### Protected Routes

The following routes require authentication:
- `/api/budbar/*` - The BudBar page and related functionality
- `/api/membership/*` - Membership information and features
- `/api/user/*` - User profile and settings
- `/api/admin/*` - Administrative functions (requires admin role)

## Data Freshness Strategy

The system implements a multi-layered approach to ensure data freshness:

### Phase 1: Database Connection Enhancement (Implemented)
- Connection health monitoring
- Query timeout configuration
- Connection event logging
- Query caching interface

### Phase 2: API Layer Enhancement (Implemented)
- Cache headers in API responses (ETag, Last-Modified, Cache-Control)
- Conditional request handling (If-None-Match, If-Modified-Since)
- Version information in responses (X-API-Version)
- Forced refresh capability (X-Force-Refresh header)

### Phase 3: Caching Implementation (Implemented)
- Time-based caching for read-heavy endpoints
- Cache invalidation triggers
- Background refresh jobs
- Cache monitoring and dashboard

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Connection | ✅ Implemented | Enhanced with health checks and caching |
| Basic API Endpoints | ✅ Implemented | All strain endpoints working |
| Authentication | ⚠️ Partially Implemented | Disabled for strain endpoints |
| Caching | ✅ Implemented | Basic query caching available |
| Error Handling | ✅ Implemented | Comprehensive error handling |
| Logging | ✅ Implemented | Detailed request and response logging |
| Data Freshness | ✅ Implemented | All phases complete |

## Future Enhancements

1. **Complete Authentication**
   - Re-enable JWT authentication with proper error handling
   - Implement role-based access control

2. **API Enhancements**
   - Add pagination metadata to all responses
   - Implement filtering for all endpoints
   - Add search functionality

3. **Performance Optimizations**
   - Implement database indexing strategy
   - Add response compression
   - Optimize query performance

4. **Frontend Integration**
   - Develop data fetching hooks
   - Implement client-side caching
   - Add manual refresh functionality

5. **Monitoring and Analytics**
   - Add request tracking
   - Implement performance monitoring
   - Create usage analytics

## Technical Details

### Database Connection

The database connection is managed through a connection pool:

```javascript
// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: process.env.DB_QUEUE_LIMIT || 0,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true'
});

// Create a promise wrapper for the pool
const db = pool.promise();
```

Key features:
- Connection pooling for efficiency
- Promise-based interface for async/await support
- Error handling for connection issues
- Health monitoring for connection stability

### Authentication Implementation

The authentication system is implemented in:
- `/config/api/middleware/auth.js`: Authentication middleware
- `/config/api/routes/auth.js`: Authentication routes
- `/config/api/services/authService.js`: Authentication business logic
- `/config/api/utils/tokenUtils.js`: Token generation and validation

Example JWT token generation:
```javascript
const jwt = require('jsonwebtoken');

function generateTokens(user) {
  const accessToken = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
  
  return { accessToken, refreshToken };
}
```

### Cache Service

The cache service provides a comprehensive caching solution:

```javascript
// Example usage of cache service
const result = await cacheService.get('strains:list', async () => {
  // Fetch data from database
  const [rows] = await db.execute('SELECT * FROM strains');
  return rows;
}, {
  ttl: 300, // 5 minutes
  namespace: 'api',
  backgroundRefresh: true,
  dependencies: ['strains']
});
```

Key features:
- Time-based expiration (TTL)
- Namespace support
- Background refresh
- Dependency tracking
- Cache invalidation triggers
- Detailed statistics

### Background Refresh

The background refresh service keeps cache data fresh:

```javascript
// Example of scheduling a background refresh job
const jobId = backgroundRefresh.startRefreshJob({
  key: 'strains:list',
  namespace: 'api',
  cronExpression: '*/15 * * * *', // Every 15 minutes
  ttl: 900, // 15 minutes
  fetchFunction: async () => {
    const [rows] = await db.execute('SELECT * FROM strains');
    return rows;
  }
});
```

Key features:
- Scheduled refresh jobs
- Pre-warming of critical endpoints
- Job management (start, stop, status)
- Graceful shutdown

### Cache Monitoring

The cache monitoring service provides insights into cache performance:

```javascript
// Example of getting monitoring statistics
const stats = cacheMonitoring.getMonitoringStats({
  includeHistory: true,
  historyLimit: 10
});
```

Key features:
- Performance metrics collection
- Historical data tracking
- Issue detection and alerting
- Statistics export
- Response time monitoring

### Cache Dashboard

The cache dashboard provides a comprehensive interface for managing the cache:

- View cache statistics and performance metrics
- Browse and search cache keys
- View detailed information about cached items
- Clear cache (all or by pattern)
- Manage background refresh jobs
- Export statistics for analysis

### Response Middleware

The system implements middleware for handling data freshness:

```javascript
// Example middleware usage
app.use('/api/strains', 
  allowForcedRefresh(),
  handleConditionalRequests(),
  addCacheHeaders({ maxAge: 300, includeETag: true }),
  strainsRoutes
);
```

Middleware features:
- ETag generation for responses
- Last-Modified headers
- Cache-Control directives
- Conditional request handling (304 Not Modified)
- Forced refresh capability

### Response Format

All API responses include metadata for data freshness:

```json
{
  "data": [...],
  "metadata": {
    "timestamp": "2023-04-15T12:34:56.789Z",
    "version": "1.0.0",
    "freshness": {
      "generated": "2023-04-15T12:34:56.789Z",
      "ttl": 300,
      "expires": "2023-04-15T12:39:56.789Z"
    }
  }
}
```

---

**Last Updated**: May 10, 2023  
**Version**: 2.1.0  
**Author**: Development Team
