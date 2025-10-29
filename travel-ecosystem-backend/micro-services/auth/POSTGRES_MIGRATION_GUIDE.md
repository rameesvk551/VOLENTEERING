# PostgreSQL Migration Guide

## Overview
This guide documents the migration from MongoDB/Mongoose to PostgreSQL/Sequelize for the Authentication Service.

## Changes Made

### 1. Database Configuration
**File:** `src/config/database.ts`
- Replaced Mongoose connection with Sequelize
- Added PostgreSQL connection pooling
- Configured automatic table synchronization in development mode

### 2. User Model
**File:** `src/models/User.ts`
- Converted from Mongoose Schema to Sequelize Model
- Changed ID field from MongoDB ObjectId to PostgreSQL auto-increment integer
- Updated all field definitions to Sequelize DataTypes
- Converted preferences field to JSONB (PostgreSQL native JSON type)
- Converted refreshTokens array to PostgreSQL ARRAY type
- Added indexes for better query performance
- Password hashing now uses Sequelize hooks (beforeSave)

### 3. Controller Updates
**File:** `src/controllers/auth.controller.ts`

Key changes:
- `User.findOne({ email })` → `User.findOne({ where: { email } })`
- `User.findById(id)` → `User.findByPk(id)`
- `user._id` → `user.id` (now returns integer instead of string)
- Removed `.select('+password')` - Sequelize includes password by default
- MongoDB comparison operators (`$gt`, etc.) replaced with JavaScript comparisons
- Token generation functions updated to accept `number` instead of `string` for user ID
- Array operations updated for PostgreSQL ARRAY type

### 4. Middleware Updates
**File:** `src/middleware/auth.middleware.ts`
- Updated `AuthRequest` interface to use `number` for user ID

### 5. Dependencies
**File:** `package.json`
- Removed: `mongoose`
- Added: `pg`, `pg-hstore`, `sequelize`
- Added dev dependency: `@types/validator`

## Environment Variables

Update your `.env` file with PostgreSQL connection details:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_auth
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration (unchanged)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (unchanged)
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Database Setup

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
```

### 2. Create Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE travel_auth;

-- Create user (optional)
CREATE USER travel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE travel_auth TO travel_user;
```

### 3. Run the Service
The tables will be created automatically when you start the service in development mode:

```bash
npm run dev
```

## Data Migration

If you have existing MongoDB data, you'll need to migrate it:

### Option 1: Manual Migration Script
Create a migration script to export MongoDB data and import to PostgreSQL:

```typescript
// migrate-data.ts
import mongoose from 'mongoose';
import { sequelize, User } from './src/models/User';

async function migrateData() {
  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/travel-auth');
  const MongoUser = mongoose.model('User', /* your old schema */);
  
  // Connect to PostgreSQL
  await sequelize.sync({ force: true });
  
  // Get all users from MongoDB
  const mongoUsers = await MongoUser.find({});
  
  // Insert into PostgreSQL
  for (const user of mongoUsers) {
    await User.create({
      name: user.name,
      email: user.email,
      password: user.password, // Already hashed
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      preferences: user.preferences,
      refreshTokens: user.refreshTokens || [],
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }
  
  console.log('Migration completed!');
}

migrateData();
```

### Option 2: Export/Import via CSV
1. Export MongoDB data to CSV
2. Import CSV to PostgreSQL using `COPY` command

## Key Differences to Note

### ID Field
- **MongoDB:** `_id` (ObjectId, 24-character hex string)
- **PostgreSQL:** `id` (integer, auto-increment)

**Impact:** JWT tokens now contain numeric IDs. Old tokens with string IDs won't work after migration.

### Array Fields
- **MongoDB:** Native array support
- **PostgreSQL:** Uses ARRAY data type
- Array operations remain similar but use PostgreSQL array functions

### JSON Fields
- **MongoDB:** Native object support
- **PostgreSQL:** Uses JSONB data type
- More efficient storage and querying than JSON type

### Timestamps
- **MongoDB:** Automatic with `timestamps: true`
- **Sequelize:** Automatic with `timestamps: true` option

## Testing

After migration, test these key operations:

1. ✅ User Registration
2. ✅ Email Verification
3. ✅ Login
4. ✅ Token Refresh
5. ✅ Password Reset
6. ✅ Password Change
7. ✅ Profile Update
8. ✅ Get User Profile

## Performance Considerations

### Indexes
The following indexes are automatically created:
- `email` (unique)
- `role`
- `isActive`

### Connection Pooling
Configured with:
- max: 5 connections
- min: 0 connections
- acquire: 30000ms timeout
- idle: 10000ms idle timeout

Adjust these values in `src/config/database.ts` based on your load.

## Troubleshooting

### Common Issues

1. **Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   - Ensure PostgreSQL is running
   - Check DB_HOST and DB_PORT in .env

2. **Authentication Failed**
   ```
   Error: password authentication failed for user "postgres"
   ```
   - Check DB_USER and DB_PASSWORD in .env
   - Verify PostgreSQL user credentials

3. **Database Does Not Exist**
   ```
   Error: database "travel_auth" does not exist
   ```
   - Create the database manually (see Database Setup section)

4. **Type Errors**
   - Ensure all `_id` references are changed to `id`
   - Ensure JWT payload uses `number` for id

## Rollback Plan

If you need to rollback to MongoDB:

1. Keep the MongoDB service running during initial migration
2. Backup MongoDB data before migration
3. Keep the original code in a separate branch
4. Test thoroughly before decommissioning MongoDB

## Production Deployment

For production:

1. **Database Sync:** Remove `alter: true` and use migrations instead
2. **Connection String:** Use connection URL format if needed:
   ```typescript
   new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })
   ```
3. **SSL:** Enable SSL for database connections
4. **Pooling:** Adjust pool settings based on expected load
5. **Monitoring:** Set up PostgreSQL monitoring and logging

## References

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://sequelize.org/docs/v6/other-topics/migrations/)
