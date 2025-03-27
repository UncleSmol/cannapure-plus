# CannapurePlus Database Restructuring Documentation
**Version 1.0** | Last Updated: March 2025
# AUTHOR: Doc (DEV-DOC)

## Table of Contents
1. [Current Schema Analysis](#1-current-schema-analysis)
2. [Proposed Universal Table Structure](#2-proposed-universal-table-structure)
3. [Data Migration Plan](#3-data-migration-plan)
4. [API Endpoint Simplification](#4-api-endpoint-simplification)
5. [Authentication Enforcement](#5-authentication-enforcement)
6. [Caching Strategy](#6-caching-strategy)
7. [Error Standardization](#7-error-standardization)
8. [Validation Rules](#8-validation-rules)
9. [Testing Checkpoints](#9-testing-checkpoints)
10. [Rollback Plan](#10-rollback-plan)

## 1. Current Schema Analysis

### Identified Issues

#### Fragmented Strain Tables:
- Separate tables for `medical_strains`, `edibles`, `extracts_vapes`, etc., with duplicate structures
- Hard to maintain and query across categories

#### Inconsistent THC/CBD Storage:
- Stored as strings (e.g., "THC: 20%") instead of numeric values

#### No Category Column:
- Strain type is inferred from the table name instead of a dedicated column

#### Authentication Gaps:
- Strain endpoints lack role-based access controls

#### Caching Conflicts:
- Server and frontend implement separate caching strategies

## 2. Proposed Universal Table Structure

### New Table: `strains`

```sql
CREATE TABLE `strains` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('medical', 'edible', 'extract', 'pre_rolled', 'indoor', 'greenhouse', 'exotic') NOT NULL,
  `type` ENUM('Sativa', 'Indica', 'Hybrid') NOT NULL,
  `thc` DECIMAL(5,2) COMMENT 'THC percentage (e.g., 22.50)',
  `cbd` DECIMAL(5,2) COMMENT 'CBD percentage (e.g., 5.00)',
  `price` DECIMAL(10,2) NOT NULL,
  `measurement` VARCHAR(50) DEFAULT '3g',
  `description` TEXT,
  `image_url` VARCHAR(500),
  `store_location` VARCHAR(255),
  `special` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_strain` (`name`, `category`)
);
```

### Key Changes

- **Single Table**: Replace all category-specific tables with `strains`
- **Numeric Potency**: `thc` and `cbd` stored as decimals for accurate filtering
- **Category Enum**: Explicitly defines strain types

## 3. Data Migration Plan

### Step 1: Create `strains` Table
Execute the CREATE TABLE statement above.

### Step 2: Migrate Existing Data

```sql
-- Example: Migrate medical_strains
INSERT INTO strains (
  name, category, type, thc, cbd, price, measurement, 
  description, image_url, store_location, special
)
SELECT 
  strain_name, 
  'medical' AS category,
  strain_type,
  SUBSTRING_INDEX(SUBSTRING_INDEX(thc, ':', -1), '%', '') AS thc,
  SUBSTRING_INDEX(SUBSTRING_INDEX(thc, 'CBD:', -1), '%', '') AS cbd,
  price,
  measurement,
  description,
  image_url,
  store_location,
  special
FROM medical_strains;
```

*Repeat for edibles, extracts_vapes, etc.*

### Step 3: Drop Legacy Tables

```sql
DROP TABLE medical_strains, edibles, extracts_vapes, ...;  
```
## 4. API Endpoint Simplification

### New Endpoint Structure

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/v1/strains` | GET | Public | Get all strains (filter by category) |
| `/api/v1/strains/:id` | GET | Public | Get strain by ID |
| `/api/v1/strains` | POST | Admin (JWT) | Create new strain |
| `/api/v1/strains/:id` | PUT/DELETE | Admin (JWT) | Update/delete strain |

### Query Parameters

- **category**: Filter by category (e.g., edible)
- **thc_min**, **thc_max**: Filter by THC range
- **sort_by**: Sort by field (e.g., price)

## 5. Authentication Enforcement

### Middleware Rules

#### Public Routes:
- GET `/api/v1/strains`
- GET `/api/v1/strains/:id`

#### Admin-Only Routes:

```javascript
// server.js  
app.use('/api/v1/strains', authMiddleware.verifyToken, authMiddleware.requireRole('admin'));  
```

#### JWT Validation:
- Add JWT checks to all POST/PUT/DELETE requests

## 6. Caching Strategy

### Server-Side Caching

#### Headers:
```
Cache-Control: public, max-age=300  
Vary: Category, Authorization  
```

### Disable Frontend Caching:
- Remove `StrainDataService` caching logic

## 7. Error Standardization

### Response Format

```json
{
  "error": {
    "code": "INVALID_THC_RANGE",
    "message": "THC must be between 0-100%",
    "timestamp": "2024-06-15T12:34:56Z"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing/invalid JWT |
| `INVALID_CATEGORY` | Invalid strain category |
| `STRAIN_NOT_FOUND` | Strain ID does not exist |
## 8. Validation Rules

### Request Validation

- **THC/CBD**:
  - Numeric, between 0–100

- **Price**:
  - Non-negative decimal

- **Category**:
  - Must match enum values

## 9. Testing Checkpoints

### Phase 1: Database Migration
- Verify all legacy data exists in `strains`
- Confirm `thc`/`cbd` values are numeric

### Phase 2: API Endpoints
- Test GET `/api/v1/strains?category=edible`
- Verify admin routes reject non-JWT requests

### Phase 3: Frontend
- Confirm UI displays data from `/api/v1/strains`
- Test error handling for invalid THC values

## 10. Rollback Plan

### Database:
- Restore backup of legacy tables

### API:
- Revert endpoints to previous structure

### Frontend:
- Rollback to version using old API paths

---

## Next Steps

1. Begin with Phase 1 (database migration)
2. Validate with test SQL queries before full deployment
3. Proceed to API updates once database is stable
