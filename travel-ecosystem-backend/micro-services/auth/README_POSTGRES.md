# Auth Service - PostgreSQL Migration

The Authentication Service has been successfully migrated from MongoDB to PostgreSQL.

## Quick Start

### 1. Install PostgreSQL

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Or download installer from https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

**Option A: Using the SQL script**
```bash
# Login to PostgreSQL
psql -U postgres

# Run the setup script
\i setup-db.sql

# Or on Windows PowerShell:
Get-Content setup-db.sql | psql -U postgres
```

**Option B: Manual setup**
```sql
-- Connect as postgres
psql -U postgres

-- Create database
CREATE DATABASE travel_auth;

-- Exit
\q
```

### 3. Configure Environment

Copy the example environment file and update with your settings:
```bash
cp .env.example .env
```

Edit `.env` and update the PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_auth
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Service

**Development mode (with auto-sync):**
```bash
npm run dev
```

The database tables will be created automatically on first run.

**Production mode:**
```bash
npm run build
npm start
```

## What Changed?

### Database
- ✅ MongoDB → PostgreSQL
- ✅ Mongoose → Sequelize ORM
- ✅ ObjectId → Integer IDs
- ✅ Native arrays → PostgreSQL ARRAY type
- ✅ Embedded objects → JSONB type

### Code Updates
- ✅ User model converted to Sequelize
- ✅ All queries updated for Sequelize syntax
- ✅ Database configuration using connection pooling
- ✅ Middleware updated for integer IDs
- ✅ Proper indexes added for performance

### Features Preserved
- ✅ User registration with email verification
- ✅ Login/logout with JWT tokens
- ✅ Password reset functionality
- ✅ Profile management
- ✅ Role-based access control
- ✅ Token refresh mechanism

## API Endpoints

All existing endpoints remain the same:

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user profile (authenticated)
- `PUT /api/auth/update-profile` - Update profile (authenticated)

## Database Schema

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | User ID |
| name | VARCHAR(50) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'user' | User role |
| isEmailVerified | BOOLEAN | DEFAULT false | Email verification status |
| profileImage | VARCHAR(500) | NULLABLE | Profile image URL |
| phone | VARCHAR(20) | NULLABLE | Phone number |
| bio | TEXT | NULLABLE | User bio |
| location | VARCHAR(100) | NULLABLE | User location |
| preferences | JSONB | NULLABLE | User preferences |
| resetPasswordToken | VARCHAR(255) | NULLABLE | Password reset token |
| resetPasswordExpires | TIMESTAMP | NULLABLE | Reset token expiry |
| emailVerificationToken | VARCHAR(255) | NULLABLE | Email verification token |
| emailVerificationExpires | TIMESTAMP | NULLABLE | Verification token expiry |
| refreshTokens | TEXT[] | DEFAULT [] | Active refresh tokens |
| lastLogin | TIMESTAMP | NULLABLE | Last login timestamp |
| isActive | BOOLEAN | DEFAULT true | Account active status |
| createdAt | TIMESTAMP | AUTO | Record creation time |
| updatedAt | TIMESTAMP | AUTO | Last update time |

### Indexes
- `users_email_unique` (email) - Unique index for fast email lookups
- `users_role` (role) - Index for role-based queries
- `users_is_active` (isActive) - Index for active user queries

## Testing

Test the service with these curl commands:

**Health Check:**
```bash
curl http://localhost:4001/health
```

**Register User:**
```bash
curl -X POST http://localhost:4001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4001
```
Solution: Kill the process using port 4001 or change PORT in .env

### Cannot Connect to PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution:
1. Ensure PostgreSQL is running
2. Check DB_HOST and DB_PORT in .env
3. Verify PostgreSQL is listening on the correct port

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
Solution:
1. Check DB_USER and DB_PASSWORD in .env
2. Update pg_hba.conf to allow password authentication
3. Restart PostgreSQL after config changes

### Database Does Not Exist
```
Error: database "travel_auth" does not exist
```
Solution: Create the database using the setup-db.sql script

## Migration from MongoDB

If you have existing MongoDB data, see `POSTGRES_MIGRATION_GUIDE.md` for detailed migration instructions.

## Performance Tips

1. **Connection Pooling**: Already configured with sensible defaults
2. **Indexes**: Already created on frequently queried fields
3. **Query Optimization**: Use `attributes` option to select specific fields
4. **Batch Operations**: Use Sequelize's bulk operations for multiple records
5. **Caching**: Consider implementing Redis for session/token caching

## Security Notes

- Passwords are hashed using bcrypt with salt rounds = 10
- JWT tokens include user ID, email, and role
- Refresh tokens are stored in database for validation
- Email verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- All tokens are cryptographically secure random bytes

## Further Reading

- [Full Migration Guide](./POSTGRES_MIGRATION_GUIDE.md)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues or questions, please check:
1. Error logs in the console
2. PostgreSQL logs
3. The troubleshooting section above
4. The migration guide for detailed explanations
