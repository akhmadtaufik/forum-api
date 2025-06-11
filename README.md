# Forum API

## Description

This project is a RESTful API for a forum application. It allows users to register, log in, create threads, post comments on threads, and reply to comments. The API is built with Node.js and the Hapi framework, using PostgreSQL as its database. It features JWT-based authentication and follows a clean architecture pattern.

## Features

- User registration and login
- JWT-based authentication (access and refresh tokens)
- Create, read threads
- Post comments on threads
- Post replies to comments
- Soft delete for comments and replies
- Detailed thread view including comments and their replies

## Tech Stack

- **Backend**: Node.js
- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Containerization**: Docker, Docker Compose
- **Migrations**: node-pg-migrate
- **Testing**: Jest
- **Linting**: ESLint (Airbnb style guide)
- **Development**: Nodemon

## Project Structure Overview

The project follows a clean architecture pattern, separating concerns into distinct layers:

- `src/Domains`: Contains business logic and entities.
- `src/Applications`: Contains application-specific logic (use cases).
- `src/Infrastructures`: Contains framework-specific implementations (e.g., Hapi server, PostgreSQL repositories, JWT management).
- `src/Interfaces`: Contains adapters to the outside world (e.g., API route handlers).
- `src/Commons`: Contains shared utilities and error definitions.
- `migrations/`: Database migration files.
- `config/`: Configuration files, including database settings.
- `tests/`: Helper files for functional/integration tests.

## Prerequisites

- Node.js (version 20.x recommended, as per Dockerfile `node:20-slim`)
- npm (comes with Node.js)
- PostgreSQL (or Docker to run PostgreSQL in a container)
- Docker and Docker Compose (for containerized setup)

## Environment Variables

Create a `.env` file in the root of the project with the following variables. Refer to `docker-compose.yml` for default values if running with Docker.

```env
# Server Configuration
PORT=5000
HOST=localhost

# Production Database (PostgreSQL)
PGUSER=your_prod_db_user
PGPASSWORD=your_prod_db_password
PGHOST=localhost # or 'postgres-db' if using docker-compose
PGPORT=your_port
PGDATABASE=forum_api_prod

# Test Database (PostgreSQL)
PGUSER_TEST=your_test_db_user
PGPASSWORD_TEST=your_test_db_password
PGHOST_TEST=localhost # or 'postgres-test' if using docker-compose
PGPORT_TEST=your_port
PGDATABASE_TEST=forum_api_test

# JWT Configuration
ACCESS_TOKEN_KEY=your_super_secret_access_token_key
REFRESH_TOKEN_KEY=your_super_secret_refresh_token_key
ACCESS_TOKEN_AGE=your_access_token_age
```

**Note**: The `docker-compose.yml` file uses `ACCCESS_TOKEN_AGE`. Ensure your application code or `.env` file uses the correct variable name expected by the JWT manager (likely `ACCESS_TOKEN_AGE`).

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd forum-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Databases

Ensure PostgreSQL is running and accessible. Create the production and test databases specified in your `.env` file.

### 4. Run Migrations

For production database (using default `database.json` or environment variables):

```bash
npm run migrate up
```

For test database (uses `config/database/test.json`):

```bash
npm run migrate:test up
```

The `config/database/test.json` and the default `database.json` (for production migrations if not using env vars directly) would need to be configured if you are not relying solely on environment variables for `node-pg-migrate`. The `docker-compose.yml` setup runs migrations automatically.

### Using Docker (Recommended for Development & Consistent Environment)

1. **Ensure Docker and Docker Compose are installed.**
2. **Create your `.env` file** in the project root as described in the "Environment Variables" section. The `PGHOST` and `PGHOST_TEST` should be set to the service names defined in `docker-compose.yml` (e.g., `postgres-db` and `postgres-test`).
3. **Build and start the services:**

    ```bash
    docker-compose up --build
    ```

    This command will:
    - Build the API image.
    - Start the API service.
    - Start the production PostgreSQL service (`postgres-db`).
    - Start the test PostgreSQL service (`postgres-test`).
    - Run database migrations for both test and production databases within the API container.
    - Start the API application.

    To run in detached mode:

    ```bash
    docker-compose up --build -d
    ```

## Running the Application

### Locally

```bash
npm run start:dev # For development with Nodemon
# or
npm run start # For production
```

The API will be available at `http://<HOST>:<PORT>`.

### With Docker

If you used `docker-compose up`, the application is already running. The API will be available at `http://localhost:<PORT_FROM_ENV_OR_DEFAULT_5000>`.

## Database Migrations

Migrations are handled by `node-pg-migrate`.

- **Run all pending migrations:**

    ```bash
    npm run migrate up # For production DB
    npm run migrate:test up # For test DB
    ```

- **Rollback the last migration:**

    ```bash
    npm run migrate down # For production DB
    npm run migrate:test down # For test DB
    ```

- **Create a new migration:**

    ```bash
    npm run migrate create <migration_name>
    ```

## Running Tests

```bash
npm test
```

This command runs Jest tests. It uses `dotenv/config` to load environment variables from `.env` and runs in band (`-i`).

To run tests in watch mode:

```bash
npm run test:watch:change # Watches for changes to files related to failed tests or uncommitted files
npm run test:watch # Watches all files and includes coverage
```

## API Endpoints

### Authentications

- **`POST /authentications`**
  - Description: Login a user. Creates new access and refresh tokens.
  - Request Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "status": "success", "data": { "accessToken": "string", "refreshToken": "string" } }`

- **`PUT /authentications`**
  - Description: Refresh an access token using a refresh token.
  - Request Body: `{ "refreshToken": "string" }`
  - Response: `{ "status": "success", "data": { "accessToken": "string" } }`

- **`DELETE /authentications`**
  - Description: Logout a user. Invalidates the provided refresh token.
  - Request Body: `{ "refreshToken": "string" }`
  - Response: `{ "status": "success" }`

### Users

- **`POST /users`**
  - Description: Register a new user.
  - Request Body: `{ "username": "string", "password": "string", "fullname": "string" }`
  - Response: `{ "status": "success", "data": { "addedUser": { "id": "string", "username": "string", "fullname": "string" } } }`

### Threads

- **`POST /threads`**
  - Description: Create a new thread.
  - Authentication: Required (Bearer Token).
  - Request Body: `{ "title": "string", "body": "string" }`
  - Response: `{ "status": "success", "data": { "addedThread": { "id": "string", "title": "string", "owner": "string" } } }`

- **`GET /threads/{threadId}`**
  - Description: Get details of a specific thread, including its comments and replies.
  - Path Parameters: `threadId` (string)
  - Response:

        ```json
        {
          "status": "success",
          "data": {
            "thread": {
              "id": "string",
              "title": "string",
              "body": "string",
              "date": "string (ISO 8601)",
              "username": "string",
              "comments": [
                {
                  "id": "string",
                  "username": "string",
                  "date": "string (ISO 8601)",
                  "content": "string (or '**komentar telah dihapus**')",
                  "replies": [
                    {
                      "id": "string",
                      "username": "string",
                      "date": "string (ISO 8601)",
                      "content": "string (or '**balasan telah dihapus**')"
                    }
                    // ... more replies
                  ]
                }
                // ... more comments
              ]
            }
          }
        }
        ```

### Comments

- **`POST /threads/{threadId}/comments`**
  - Description: Add a new comment to a specific thread.
  - Authentication: Required (Bearer Token).
  - Path Parameters: `threadId` (string)
  - Request Body: `{ "content": "string" }`
  - Response: `{ "status": "success", "data": { "addedComment": { "id": "string", "content": "string", "owner": "string" } } }`

- **`DELETE /threads/{threadId}/comments/{commentId}`**
  - Description: Delete a specific comment from a thread. (Soft delete)
  - Authentication: Required (Bearer Token).
  - Path Parameters: `threadId` (string), `commentId` (string)
  - Response: `{ "status": "success" }`

### Replies

- **`POST /threads/{threadId}/comments/{commentId}/replies`**
  - Description: Add a new reply to a specific comment.
  - Authentication: Required (Bearer Token).
  - Path Parameters: `threadId` (string), `commentId` (string)
  - Request Body: `{ "content": "string" }`
  - Response: `{ "status": "success", "data": { "addedReply": { "id": "string", "content": "string", "owner": "string" } } }`

- **`DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}`**
  - Description: Delete a specific reply. (Soft delete)
  - Authentication: Required (Bearer Token).
  - Path Parameters: `threadId` (string), `commentId` (string), `replyId` (string)
  - Response: `{ "status": "success" }`
