# Directory Structure for Phase 3 Caching Implementation

This document outlines the directory structure for the Phase 3 caching implementation, showing where each component should be placed in the existing project structure.

```
config/
├── server.js                      # Main server file (updated with Phase 3 integration)
├── database.js                    # Database connection
├── api/
│   ├── middleware/
│   │   ├── response.js            # Response middleware (updated for Phase 2)
│   │   ├── cacheInvalidation.js   # New: Cache invalidation middleware
│   ├── routes/
│   │   ├── index.js               # API routes index
│   │   ├── strains.js             # Strains routes
│   │   ├── cache-dashboard.js     # New: Cache dashboard routes
│   ├── services/
│   │   ├── cacheService.js        # New: Advanced cache service
│   │   ├── backgroundRefresh.js   # New: Background refresh service
│   │   ├── cacheMonitoring.js     # New: Cache monitoring service
│   ├── utils/
│   │   ├── db-utils.js            # Database utilities (updated for Phase 2)
```

## Integration Notes

1. **Existing Files to Update**:
   - `config/server.js`: Add Phase 3 imports and initialization
   - `config/api/middleware/response.js`: Already updated for Phase 2
   - `config/api/utils/db-utils.js`: Already updated for Phase 2

2. **New Files to Add**:
   - `config/api/middleware/cacheInvalidation.js`: Cache invalidation middleware
   - `config/api/routes/cache-dashboard.js`: Cache dashboard API routes
   - `config/api/services/cacheService.js`: Advanced cache service
   - `config/api/services/backgroundRefresh.js`: Background refresh service
   - `config/api/services/cacheMonitoring.js`: Cache monitoring service

3. **Required NPM Packages**:
   - `node-cache`: For in-memory caching
   - `node-schedule`: For scheduling background refresh jobs

## Installation

```bash
npm install node-cache node-schedule
```

## Integration Steps

1. Create the necessary directories if they don't exist
2. Add the new files
3. Update the existing files
4. Install the required packages
5. Restart the server