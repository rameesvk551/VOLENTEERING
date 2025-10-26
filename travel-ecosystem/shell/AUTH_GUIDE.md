# Authentication Usage Guide

## 🔐 How Login & Signup Work

### Quick Start

1. **Start the backend services:**
   ```bash
   cd /home/ramees/www/VOLENTEERING
   ./start-all.sh
   ```

2. **The shell app will start on:** http://localhost:5173

### User Flow

#### First Time User (Signup)
1. User visits http://localhost:5173
2. Not authenticated → redirected to `/login`
3. Click "Sign up for free"
4. Fill signup form:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
5. Submit → Creates account in Auth Service
6. Auto-login → Redirected to home page
7. User info stored in localStorage
8. JWT token included in all API requests

#### Returning User (Login)
1. User visits http://localhost:5173/login
2. Fill login form:
   - Email
   - Password
3. Submit → Auth Service validates credentials
4. Returns JWT token + Refresh token
5. Tokens stored in localStorage
6. Redirected to home page
7. Navbar shows user's name and avatar

### Features Implemented

#### ✅ Authentication Context (`AuthContext.tsx`)
- Global auth state management
- `user` - Current user object
- `isAuthenticated` - Boolean status
- `isLoading` - Loading state
- `login(email, password)` - Login function
- `signup(name, email, password)` - Signup function
- `logout()` - Logout function
- `updateUser(user)` - Update user info

#### ✅ API Service (`services/api.ts`)
- Automatic token attachment to requests
- Token refresh on 401 errors
- Auto-redirect to login on auth failure
- All auth endpoints configured

#### ✅ Protected Routes (`ProtectedRoute.tsx`)
- Redirects unauthenticated users to `/login`
- Shows loading spinner while checking auth
- Prevents authenticated users from accessing login/signup

#### ✅ Login Page (`pages/Login.tsx`)
- Email + Password form
- Error handling
- Loading states
- "Remember me" option
- "Forgot password" link
- Link to signup page

#### ✅ Signup Page (`pages/Signup.tsx`)
- Name, Email, Password form
- Password confirmation
- Validation (min 6 chars, matching passwords)
- Error handling
- Loading states
- Link to login page

#### ✅ Navbar Integration
- Shows "Sign in" & "Sign up" buttons when logged out
- Shows user avatar & name when logged in
- Dropdown menu with:
  - Profile
  - Settings
  - Admin Dashboard (if admin)
  - Sign out button

### Using the Auth System in Your Code

#### Check if user is logged in:
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

#### Programmatic login:
```typescript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

#### Logout:
```typescript
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={() => logout()}>
      Logout
    </button>
  );
}
```

#### Protect a route:
```typescript
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### API Endpoints Used

All requests go through API Gateway at `http://localhost:4000`:

- **POST** `/api/auth/signup` - Create account
- **POST** `/api/auth/login` - Login
- **POST** `/api/auth/logout` - Logout
- **GET** `/api/auth/me` - Get current user
- **POST** `/api/auth/refresh-token` - Refresh JWT token
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password
- **POST** `/api/auth/change-password` - Change password
- **PUT** `/api/auth/update-profile` - Update profile

### Token Flow

1. **Login/Signup** → Backend returns:
   ```json
   {
     "success": true,
     "data": {
       "user": { "id": "...", "name": "...", "email": "..." },
       "token": "eyJhbGc...",
       "refreshToken": "eyJhbGc..."
     }
   }
   ```

2. **Stored in localStorage:**
   - `token` - JWT access token (expires in 7 days)
   - `refreshToken` - Refresh token (expires in 30 days)
   - `user` - User object

3. **Every API request:**
   - `Authorization: Bearer {token}` header added automatically

4. **Token expires:**
   - API returns 401
   - Interceptor catches it
   - Auto-refreshes using refresh token
   - Retries original request

5. **Refresh token expires:**
   - User logged out
   - Redirected to login page

### Testing

#### Test Signup:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Test Login:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Security Features

✅ Passwords hashed with bcrypt
✅ JWT tokens with expiration
✅ Refresh token rotation
✅ Protected routes
✅ CORS configured
✅ Rate limiting on API Gateway
✅ Input validation

### Common Issues & Solutions

#### Issue: "Cannot connect to backend"
**Solution:** Make sure backend is running:
```bash
cd travel-ecosystem-backend
npm run dev
```

#### Issue: "Token expired" errors
**Solution:** Automatic refresh is implemented. If it fails, user is logged out.

#### Issue: "CORS errors"
**Solution:** Check `.env` file has correct API URL and CORS is configured in backend.

#### Issue: User stays logged in after closing browser
**Solution:** Tokens are in localStorage. To implement "Remember me" properly, use sessionStorage instead.

### Next Steps

1. ✅ Login & Signup - **DONE**
2. ✅ Protected routes - **DONE**
3. ✅ Token refresh - **DONE**
4. ✅ User menu - **DONE**
5. ⚠️ Forgot password UI - Create page
6. ⚠️ Profile page - Create page
7. ⚠️ Settings page - Create page
8. ⚠️ Email verification UI - Create page

### Files Created

```
shell/
├── src/
│   ├── services/
│   │   └── api.ts                    ✅ API client & auth functions
│   ├── context/
│   │   └── AuthContext.tsx           ✅ Global auth state
│   ├── components/
│   │   ├── ProtectedRoute.tsx        ✅ Route protection
│   │   └── Navbar/
│   │       └── Navbar.tsx            ✅ Updated with auth UI
│   ├── pages/
│   │   ├── Login.tsx                 ✅ Login form
│   │   └── Signup.tsx                ✅ Signup form
│   ├── App.tsx                       ✅ Updated with routes
│   └── .env                          ✅ API URL config
```

### Ready to Use! 🎉

Your authentication system is **100% functional**. Just start the services and visit http://localhost:5173!
