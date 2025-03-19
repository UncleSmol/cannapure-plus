# CannapurePlus Frontend Authentication Documentation

## Overview

The CannapurePlus frontend authentication system integrates with the backend JWT-based authentication to provide secure access to protected resources like the BudBar and Membership areas. The system handles user registration, login, token management, and protected routes.

## Authentication Flow

1. **User Registration**: New users register with their details
2. **Login**: Users authenticate with credentials to receive JWT tokens
3. **Token Management**: Access and refresh tokens are managed automatically
4. **Protected Routes**: Authenticated users can access restricted content
5. **Logout**: Users can securely end their session

## Components and Services

### Authentication Service

**File: `src/services/AuthService.js`**

The `AuthService` handles token management and authentication state:

```javascript
class AuthService {
  // Token management
  getToken() { /* Retrieves access token from storage */ }
  setToken(token) { /* Stores access token */ }
  getRefreshToken() { /* Retrieves refresh token */ }
  setRefreshToken(token) { /* Stores refresh token */ }
  clearTokens() { /* Removes all tokens */ }
  
  // Authentication state
  isAuthenticated() { /* Checks if user has valid token */ }
  getUser() { /* Gets user data from token */ }
  
  // Token operations
  refreshToken() { /* Refreshes access token using refresh token */ }
  decodeToken(token) { /* Decodes JWT token */ }
  isTokenExpired(token) { /* Checks if token is expired */ }
}
```

### API Service

**File: `src/services/ApiService.js`**

The `ApiService` handles API requests with authentication:

```javascript
class ApiService {
  // Authentication endpoints
  register(userData) { /* Registers new user */ }
  login(credentials) { /* Authenticates user */ }
  logout() { /* Ends user session */ }
  refreshToken(refreshToken) { /* Gets new access token */ }
  
  // Protected endpoints
  getBudBarData() { /* Gets BudBar data */ }
  getMembershipData() { /* Gets membership data */ }
  
  // Request handling
  setAuthHeader() { /* Adds auth header to requests */ }
  handleApiError(error) { /* Handles API errors */ }
}
```

### Authentication Context

**File: `src/context/AuthContext.jsx`**

The `AuthContext` provides authentication state to the application:

```javascript
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  error: null
});

export const AuthProvider = ({ children }) => {
  // State management
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Authentication methods
  const login = async (credentials) => { /* ... */ };
  const register = async (userData) => { /* ... */ };
  const logout = async () => { /* ... */ };
  
  // Token refresh and validation
  useEffect(() => {
    // Initialize auth state from storage
    // Set up token refresh interval
  }, []);
  
  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Route Component

**File: `src/components/ProtectedRoute.jsx`**

The `ProtectedRoute` component restricts access to authenticated users:

```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : null;
};
```

### Authentication Forms

**Files in: `src/components/user_auth/`**

- **Login Form**: Handles user authentication
- **Registration Form**: Handles new user registration
- **Password Reset Form**: Handles password reset requests

## Token Management

### Storage Strategy

The system uses a combination of storage mechanisms:

- **Access Token**: Stored in memory and localStorage for persistence
- **Refresh Token**: Stored in localStorage or HTTP-only cookies (configurable)

### Token Refresh Logic

1. Before making authenticated requests, check if access token is expired
2. If expired, use refresh token to obtain a new access token
3. If refresh fails, redirect to login page
4. Implement automatic background refresh before token expiration

### Security Considerations

- Tokens are validated for expiration before use
- HTTP-only cookies are used for refresh tokens when enabled
- Sensitive operations require re-authentication
- Tokens are cleared on logout

## Integration with Backend

### API Endpoints

The frontend connects to these backend authentication endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Authenticate a user |
| `/api/auth/refresh` | POST | Refresh an access token |
| `/api/auth/logout` | POST | Invalidate tokens |
| `/api/auth/profile` | GET | Get user profile |

### Request Headers

Authenticated requests include:

```
Authorization: Bearer <access_token>
```

### Error Handling

The system handles these authentication errors:

- `INVALID_CREDENTIALS`: Wrong email or password
- `ACCOUNT_LOCKED`: Account is locked due to failed attempts
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: JWT token is invalid
- `REFRESH_FAILED`: Unable to refresh token

## Protected Routes

The following routes require authentication:

- `/budbar`: The BudBar page and related functionality
- `/membership`: Membership information and features

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication Service | To be implemented | Core token management |
| API Service | To be implemented | API request handling |
| Auth Context | To be implemented | State management |
| Protected Route | To be implemented | Route protection |
| Login Form | Exists | Needs integration |
| Registration Form | Exists | Needs integration |
| Token Refresh | To be implemented | Automatic refresh |
| Error Handling | To be implemented | User feedback |

## Implementation Plan

1. **Create Authentication Service**:
   - Implement token storage and retrieval
   - Add token validation and decoding
   - Implement token refresh logic

2. **Create API Service**:
   - Implement authentication endpoints
   - Add request interceptors for auth headers
   - Add response interceptors for error handling

3. **Implement Auth Context**:
   - Create authentication state management
   - Add login, register, and logout functions
   - Implement automatic token refresh

4. **Update Protected Routes**:
   - Implement route protection based on auth state
   - Add loading states and redirects

5. **Connect Authentication Forms**:
   - Update existing forms to use new services
   - Add validation and error handling
   - Improve user feedback

## Usage Examples

### Login

```javascript
const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await login({ email, password });
    // Redirect on success
  } catch (error) {
    // Handle error
  }
};
```

### Protected Component

```javascript
const MyProtectedComponent = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Your membership tier: {user.membershipTier}</p>
    </div>
  );
};

// Usage
<ProtectedRoute>
  <MyProtectedComponent />
</ProtectedRoute>
```

### API Request

```javascript
const { getBudBarData } = useApi();

const fetchData = async () => {
  try {
    const data = await getBudBarData();
    setItems(data);
  } catch (error) {
    // Handle error
  }
};
```

## Security Best Practices

1. **Token Storage**:
   - Never store sensitive information in localStorage
   - Use HTTP-only cookies for refresh tokens when possible
   - Clear tokens on logout

2. **Request Security**:
   - Use HTTPS for all requests
   - Implement CSRF protection
   - Validate all user inputs

3. **Error Handling**:
   - Don't expose sensitive information in error messages
   - Provide user-friendly error messages
   - Log authentication failures

4. **Session Management**:
   - Implement automatic session timeout
   - Allow users to manage active sessions
   - Provide "Remember Me" functionality

---

**Last Updated**: April 15, 2023  
**Version**: 1.0.0  
**Author**: Development Team