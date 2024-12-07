# API Endpoints Documentation

## Authentication Endpoints

### 1. Create a New User Account

**Endpoint:** `POST /auth/sign-up`

**Description:** Creates a new user account with the provided credentials and returns a JWT, sets auth cookies, and sends an authentication email.

**Request Parameters:**

- **`req.body.username`**: `string` - The username for the new account.
- **`req.body.password`**: `string` - The password for the new account.
- **`req.body.email`**: `string` - The email for the new account.

**Responses:**

- **201 Created**: Successfully created the user account.

  - **Trigger**: All provided fields are valid, and the username and email are unique.
  - **Example Response:**

    ```json
    {
      "status": "success",
      "data": null,
      "message": "User account successfully created.",
      "statusCode": 201
    }
    ```

- **400 Bad Request**: Invalid input.

  - **Trigger**: Missing or invalid username, password, or email fields.
  - **Example Response:**

    ```json
    {
      "status": "error",
      "message": "Invalid input fields.",
      "statusCode": 400
    }
    ```

- **409 Conflict**: Username or email already exists.

  - **Trigger**: The username or email is already registered.
  - **Example Response:**

    ```json
    {
      "status": "error",
      "message": "Username or email already exists.",
      "statusCode": 409
    }
    ```

---

### 2. User Sign-In

**Endpoint:** `POST /auth/sign-in`

**Description:** Authenticates a user by validating credentials, checks password hash, and returns a JWT token and user data.

**Request Parameters:**

- **`req.body.username`**: `string` - The username provided by the user.
- **`req.body.password`**: `string` - The password provided by the user.

**Responses:**

- **201 Created**: Sign-in successful.

  - **Trigger**: Valid username and password match.
  - **Example Response:**

    ```json
    {
      "status": "success",
      "data": null,
      "message": "User signed in successfully.",
      "statusCode": 201,
      "auth": {
        "token": "example.jwt.token",
        "user": {
          "username": "existinguser",
          "email": "existinguser@example.com"
        }
      }
    }
    ```

- **400 Bad Request**: Missing or invalid input.

  - **Trigger**: Username or password is missing or does not meet validation criteria.
  - **Example Response:**

    ```json
    {
      "status": "error",
      "message": "Invalid input fields.",
      "statusCode": 400
    }
    ```

- **401 Unauthorized**: Invalid credentials.

  - **Trigger**: Username does not exist or password mismatch.
  - **Example Response:**

    ```json
    {
      "status": "error",
      "message": "Invalid credentials.",
      "statusCode": 401
    }
    ```

- **500 Internal Server Error**: Unexpected server issue.

  - **Trigger**: Database or server error during authentication.
  - **Example Response:**

    ```json
    {
      "status": "error",
      "message": "An unexpected error occurred.",
      "statusCode": 500
    }
    ```

---
