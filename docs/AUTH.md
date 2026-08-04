# Authentication

## Overview

Synketsuki uses **JWT (JSON Web Token)** based authentication with **Access Tokens** and **Refresh Tokens** to provide secure access to protected resources.

The authentication flow is designed to:

- Verify user identity
- Protect private API routes
- Support persistent user sessions
- Enable secure token refresh
- Restrict access based on user roles and document permissions

## Authentication Flow

```markdown
Register
│
▼
Verify Email
│
▼
Login
│
▼
Generate Access Token + Refresh Token
│
▼
Store Tokens in HTTP Cookies
│
▼
Protected Routes
│
▼
Authentication Middleware
│
▼
Authorized Controller
```

# **Registration**

**Endpoint**

```jsx
POST / register;
```

A new user creates an account by providing:

- Full Name
- Username
- Email
- Password

After taking the input it validates the inputs.

- Ensure the full name and username meet the required length constraints.
- if Email is a valid email or not.
- Ensure the email and username are unique.
- Ensure the password satisfies all validation requirements.

After successful registration:

- Password is hashed using the bcrypt hashing algorithm.
- An email verification token/OTP is generated.
- The verification email is sent to the user's email address.
- The account remains unverified until email verification is completed.

# **Email Verification**

**Endpoint**

```jsx
POST / email - verify;
```

Email verification ensures that the registered email belongs to the user.

Process:

1. Receive the OTP from the user.
2. Retrieve the stored hashed OTP.
3. Verify the OTP.
4. Check that it has not expired.
5. Mark the account as verified.
6. Remove the stored OTP and expiry.

Only verified users are allowed to log in.

# **Login**

**Endpoint**

```jsx
POST /log-in
```

After successful verification, users can log in using:

- Email / Username
- Password

The login flow:

1. Find the user.
2. Compare the supplied password with the stored password hash using bcrypt
3. Ensure the email has been verified.
4. Generate:
   - Access Token
   - Refresh Token
5. Save the refresh token.
6. Send both tokens as secure HTTP cookies.

# **_Access Token_**

The access token is short-lived.

Purpose:

- Authenticate protected API requests.
- Identify the currently logged-in user.
- Verified on every protected request
- HTTP is stateless, meaning the server does not automatically remember previous requests. The access token allows the server to identify the authenticated user on each protected request.

Typical payload:

```json
{
  "id": "...",
  "email": "...",
  "role": "user"
}
```

# **_Refresh Token_**

The refresh token is long-lived.

How to create:

- The refresh token is also a signed JWT with a longer expiration time than the access token.

Purpose:

- Generate a new access token without requiring the user to log in again.

The refresh token is:

- Stored in the database
- Stored in HTTP-only cookies
- Rotated when necessary
- Invalidated on logout

# **Send Email Verification OTP**

**Endpoint**

```jsx
POST / send - email - verification - otp;
```

Generates and sends a new verification OTP if the previous one has expired or the user requests another verification email.

### **Flow**

1. Verify the account exists.
2. Generate a new OTP.
3. Hash the OTP.
4. Store the new expiry time.
5. Send the verification email.

# **_Authentication Middleware_**

Protected routes use the `logInAuth` middleware.

The middleware performs the following steps:

1. Read the Access Token from cookies.
2. Verify the JWT signature.
3. Decode the token payload.
4. Find the corresponding user.
5. Ensure the account still exists.
6. Ensure the email is verified.
7. Attach the authenticated user to:

```jsx
req.user;
```

If any step fails, the request is rejected with an authentication error.

How to execute?

(EXAMPLE)

```jsx
authRouter.post("/end-point", logInAuth, controller);
```

Flow:

```
Request
↓
logInAuth
↓
Verify JWT
↓
Find User
↓
req.user
↓
next()
↓
Controller
```

When a protected route is requested, Express executes the `logInAuth` middleware before invoking the controller. If authentication succeeds, the middleware attaches the authenticated user to `req.user` and passes control to the controller using `next()`.

# **Logout**

**Endpoint**

```jsx
GET / log - out;
```

**Authentication Required:** Yes

Logs the current user out.

### **Flow**

1. Verify the user.
2. Remove the stored Refresh Token.
3. Clear authentication cookies (Access Token and Refresh Token).
4. Return a success response.

# **Change Password**

**Endpoint**

```jsx
POST / change - password;
```

**Authentication Required:** Yes (User needs to be logged-in)

Allows an authenticated user to change their password.

User Input:

- current password
- new password
- confirm new password

### **Flow**

1. Verify the current password.
2. Validate the new password.
   1. new password and confirm new password are same
   2. new password meets the password validation requirements.
3. Hash the new password.
4. Save the updated password.
5. Return success.

# **Forgot Password**

**Endpoint**

```jsx
POST / forgot - password;
```

Initiates the password recovery process.

### **Flow**

1. Receive the user's Email / Username.
2. Verify the account exists.
3. Generate a password reset token or OTP.
4. Hash the token before storing it.
5. Save the expiry time.
6. Send the password reset email.
7. Return success.

# **Reset Password**

**Endpoint**

```jsx
POST / reset - password;
```

Completes the password recovery process.

User Input:

- new password
- confirm new password

### **Flow**

1. Receive the reset token or OTP.
2. Verify the token.
3. Check expiration.
4. Validate the new password.
   1. new password and confirm new password are same
   2. Ensure the new password satisfies all validation requirements.
5. Hash the new password.
6. Save the new password.
7. Remove the reset token and expiration time from Data Base..
8. Return success.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Cookie Parser
- Nodemailer
- Mailgen

# **Security Features**

The authentication system includes:

- Password hashing using bcrypt
- Passwords are never stored in plain text.
- Sensitive tokens are hashed before being stored.
- Authentication cookies are HTTP-only.
- JWT Authentication
- JWT expiration limits exposure if a token is compromised.
- Refresh Token support
- HTTP-only authentication cookies
- Email verification
- OTP hashing
- OTP expiration
- Protected routes
- Request validation
- Centralized error handling

---

# **Error Responses**

Common authentication-related responses include:

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 400         | Invalid request data                     |
| 401         | Authentication failed                    |
| 403         | Unauthorized access                      |
| 404         | Resource not found                       |
| 409         | Conflict (duplicate user, invalid state) |
| 422         | Validation failed                        |
| 500         | Internal server error                    |

---

# **Summary**

Synketsuki's authentication system provides secure user authentication using JWTs, refresh tokens, email verification, password recovery, and protected routes. Every protected endpoint is authenticated through the `logInAuth` middleware, ensuring that only verified users can access secured resources.
