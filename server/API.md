# AI Resume Builder — REST API Reference Documentation

Comprehensive API documentation for the AI Resume Builder platform.

---

## Table of Contents

1. [Architecture & Conventions](#1-architecture--conventions)
2. [Authentication & Security](#2-authentication--security)
3. [Global Response & Error Envelopes](#3-global-response--error-envelopes)
4. [Health & System Status](#4-health--system-status)
5. [Authentication & Session Management](#5-authentication--session-management)
6. [User Profile Management](#6-user-profile-management)
7. [Resume Management](#7-resume-management)
8. [Resume Versioning](#8-resume-versioning)
9. [Job Description Management](#9-job-description-management)
10. [AI Resume Optimization & Tailoring](#10-ai-resume-optimization--tailoring)
11. [ATS Scorecard & Keyword Analysis](#11-ats-scorecard--keyword-analysis)
12. [AI In-Editor Assistant & Suggestions](#12-ai-in-editor-assistant--suggestions)
13. [Notification Services](#13-notification-services)
14. [Backward Compatibility Matrix](#14-backward-compatibility-matrix)

---

## 1. Architecture & Conventions

- **Base URL (Local):** `http://localhost:5001/api`
- **Base URL (Production Render):** `https://ai-resume-builder-api.onrender.com/api`
- **Resource Naming:** Lowercase, kebab-case, plural nouns (`/job-descriptions`, `/resume-optimizations`, `/ats-evaluations`).
- **HTTP Methods:** CRUD actions are expressed strictly via standard HTTP verbs:
  - `GET`: Read resources (idempotent, safe).
  - `POST`: Create new resources or execute idempotent calculations.
  - `PATCH`: Partially update existing resources.
  - `DELETE`: Remove existing resources.
- **Content Types:** `application/json` for standard requests; `multipart/form-data` for file uploads.

---

## 2. Authentication & Security

The platform supports dual authentication:
1. **HTTP-Only Cookie:** `token=<jwt_token>` (configured with `httpOnly: true`, `secure: true` in production, `sameSite: "lax"`).
2. **Bearer Authorization Header:** `Authorization: Bearer <jwt_token>` (for automated clients and mobile/external access).
3. **Short-Lived Query Token:** `?token=<temp_jwt>` accepted exclusively on the `/api/resumes/:id/print-preview` endpoint to enable Puppeteer headless rendering without cookie transmission.

---

## 3. Global Response & Error Envelopes

### Success Envelope
All successful requests return HTTP `200` or `201` with:
```json
{
  "success": true,
  "message": "Optional human-readable confirmation message",
  "data": { ... },
  "meta": { ... }
}
```

### Paginated Collection Envelope
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Error Envelope
All error responses return standard HTTP `4xx` or `5xx` with:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [ ... ]
}
```

---

## 4. Health & System Status

### 4.1 System Health
- **HTTP Method:** `GET`
- **Endpoint:** `/api/health`
- **Description:** Verifies service uptime, memory consumption, and MongoDB Atlas connectivity.
- **Authentication:** Public (No auth required).
- **Request Parameters:** None.
- **Request Body:** None.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Service operational",
    "data": {
      "status": "ok",
      "uptime": 14205,
      "timestamp": "2026-09-30T16:50:00.000Z",
      "db": "connected"
    }
  }
  ```
- **Error Responses:**
  - `503 Service Unavailable`: MongoDB disconnected or down.

---

### 4.2 AI Provider Health & Ping
- **HTTP Method:** `GET`
- **Endpoint:** `/api/ai/status` *(Aliases: `/api/ai/health`, `/api/ai/ping`)*
- **Description:** Diagnostic probe verifying Google Gemini API availability and response latency (development/internal only).
- **Authentication:** Public (Returns 404 in production environment).
- **Request Parameters:** None.
- **Request Body:** None.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "AI provider is responding",
    "data": {
      "ok": true,
      "provider": "gemini",
      "model": "gemini-2.5-flash",
      "latencyMs": 420
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Production environment probe disabled.
  - `503 Service Unavailable`: AI model unreachable or quota exhausted.

---

## 5. Authentication & Session Management

### 5.1 Register User
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Description:** Creates a new user profile with hashed password, logs the user in, and sets auth cookie.
- **Authentication:** Public.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Successful Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "avatar": "",
        "authProvider": "local"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (short password, invalid email format, missing fields).
  - `400 Bad Request`: Email already in use (sanitized error message).

---

### 5.2 Login User
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Description:** Verifies credentials, issues JWT token via HTTP-only cookie and JSON response.
- **Authentication:** Public.
- **Request Body:**
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "avatar": "",
        "authProvider": "local"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or password.

---

### 5.3 Logout User
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Description:** Clears the authentication cookie and ends session.
- **Authentication:** Public / Optional.
- **Request Body:** None.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": null
  }
  ```

---

### 5.4 Google OAuth Authentication
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/google`
- **Description:** Verifies Google ID Token credential, finds or creates user account, sets auth cookie.
- **Authentication:** Public.
- **Request Body:**
  ```json
  {
    "credential": "<Google_ID_Token_JWT>"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "name": "Jane Doe",
        "email": "jane.doe@gmail.com",
        "avatar": "https://lh3.googleusercontent.com/a/...",
        "authProvider": "google"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing or invalid Google credential token.
  - `401 Unauthorized`: Token expired or signature verification failed.

---

### 5.5 Forgot Password Request
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/forgot-password`
- **Description:** Generates a cryptographically secure reset token with 1-hour expiration and dispatches reset instructions.
- **Authentication:** Public.
- **Request Body:**
  ```json
  {
    "email": "jane.doe@example.com"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "If an account with that email exists, password reset instructions have been sent.",
    "data": null
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid email format.

---

### 5.6 Reset Password with Token
- **HTTP Method:** `POST`
- **Endpoint:** `/api/auth/reset-password`
- **Description:** Validates reset token and sets new password.
- **Authentication:** Public.
- **Request Body:**
  ```json
  {
    "token": "a1b2c3d4e5f6...",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Password reset successful. You may now log in.",
    "data": null
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid or expired reset token; or password does not meet complexity requirements.

---

## 6. User Profile Management

### 6.1 Get Current User Session & Profile
- **HTTP Method:** `GET`
- **Endpoint:** `/api/users/me` *(Alias: `/api/auth/me`)*
- **Description:** Returns current user profile details if authenticated; returns `{ user: null }` if unauthenticated.
- **Authentication:** Optional.
- **Request Parameters:** None.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "avatar": "/uploads/avatars/avatar-674a2b1c.png",
        "authProvider": "local"
      }
    }
  }
  ```

---

### 6.2 Update User Profile
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/users/me`
- **Description:** Updates current user display name and profile preferences.
- **Authentication:** Required (Cookie or Bearer).
- **Request Body:**
  ```json
  {
    "name": "Jane R. Doe"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Profile updated",
    "data": {
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "name": "Jane R. Doe",
        "email": "jane.doe@example.com",
        "avatar": ""
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid name (too long or empty).
  - `401 Unauthorized`: Not authenticated.

---

### 6.3 Upload Profile Avatar
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/users/me/avatar`
- **Description:** Uploads and sets user profile avatar image.
- **Authentication:** Required.
- **Request Body:** `multipart/form-data` with `avatar` file field (JPEG, PNG, WebP up to 5MB).
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Avatar updated",
    "data": {
      "user": {
        "_id": "674a2b1c8f9d0e1a2b3c4d5e",
        "avatar": "/uploads/avatars/avatar-674a2b1c8f9d.png"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Disallowed MIME type or file size exceeded.
  - `401 Unauthorized`: Not authenticated.

---

## 7. Resume Management

### 7.1 List User Resumes
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes`
- **Description:** Retrieves paginated list of resumes owned by the authenticated user.
- **Authentication:** Required.
- **Query Parameters:**
  - `page` *(optional, integer, default: `1`)*: Page number.
  - `limit` *(optional, integer, default: `20`)*: Items per page.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "resumes": [
        {
          "_id": "674b1c2d3e4f5a6b7c8d9e0f",
          "fileName": "Software_Engineer_Resume.pdf",
          "fileType": "application/pdf",
          "fileSize": 128400,
          "template": "classic-rose-serif",
          "status": "parsed",
          "createdAt": "2026-09-30T10:00:00.000Z",
          "updatedAt": "2026-09-30T14:30:00.000Z"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "pages": 1
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Not authenticated.

---

### 7.2 Create Resume from Document Upload
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes`
- **Description:** Uploads a PDF or DOCX resume, validates magic bytes, extracts text, and parses structured fields via Gemini AI.
- **Authentication:** Required.
- **Request Body:** `multipart/form-data` with `resume` file field.
- **Successful Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "resume": {
        "_id": "674b1c2d3e4f5a6b7c8d9e0f",
        "fileName": "MyResume.pdf",
        "fileType": "application/pdf",
        "fileSize": 145020,
        "template": "classic-rose-serif",
        "status": "parsed",
        "parsedData": {
          "name": "Jane Doe",
          "summary": "Experienced Full Stack Developer...",
          "contact": {
            "email": "jane.doe@example.com",
            "phone": "+1 555-0199",
            "location": "San Francisco, CA",
            "linkedin": "https://linkedin.com/in/janedoe",
            "github": "https://github.com/janedoe"
          },
          "skills": ["JavaScript", "React", "Node.js", "Docker"],
          "experience": [
            {
              "company": "Acme Corp",
              "title": "Senior Engineer",
              "startDate": "2021",
              "endDate": "Present",
              "description": "Led backend microservices architecture."
            }
          ],
          "education": [],
          "projects": []
        }
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Disguised or corrupted PDF/DOCX (magic byte check failed).
  - `401 Unauthorized`: Not authenticated.

---

### 7.3 Create Blank Resume from Template
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes/templates/blank` *(Aliases: `/api/resumes/blank`, `/api/resumes/scratch`)*
- **Description:** Creates an empty resume initialized with prefilled user contact info and selected template.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "template": "modern-clean"
  }
  ```
- **Successful Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "resume": {
        "_id": "674b1c2d3e4f5a6b7c8d9e10",
        "fileName": "Untitled Resume",
        "template": "modern-clean",
        "status": "parsed",
        "parsedData": {
          "name": "Jane Doe",
          "contact": { "email": "jane.doe@example.com" },
          "skills": [],
          "experience": [],
          "education": [],
          "projects": []
        }
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid template identifier.
  - `401 Unauthorized`: Not authenticated.

---

### 7.4 Get Resume by ID
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes/:id`
- **Description:** Retrieves full resume record including structured parsedData, styles, and template metadata.
- **Authentication:** Required (User must own the resume).
- **Path Parameters:**
  - `id` *(string, required)*: MongoDB ObjectId.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "resume": {
        "_id": "674b1c2d3e4f5a6b7c8d9e0f",
        "fileName": "Senior_Full_Stack.pdf",
        "template": "modern-clean",
        "parsedData": { ... },
        "aiChanges": []
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Malformed ObjectId.
  - `401 Unauthorized`: Not authenticated.
  - `404 Not Found`: Resume does not exist or belongs to another user.

---

### 7.5 Update Resume
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/resumes/:id`
- **Description:** Partially updates resume metadata, template design, or parsedData sections using atomic `$set` operations. Automatically captures a historical version snapshot.
- **Authentication:** Required.
- **Path Parameters:**
  - `id` *(string, required)*: MongoDB ObjectId.
- **Request Body:**
  ```json
  {
    "fileName": "Senior_Software_Engineer_2026.pdf",
    "template": "dense-analyst-serif",
    "parsedData": {
      "name": "Jane Doe",
      "summary": "Specialist in high-throughput cloud architectures...",
      "skills": ["Go", "Kubernetes", "TypeScript", "AWS"]
    }
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "resume": {
        "_id": "674b1c2d3e4f5a6b7c8d9e0f",
        "fileName": "Senior_Software_Engineer_2026.pdf",
        "template": "dense-analyst-serif",
        "parsedData": { ... }
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid field schema or string length limits exceeded.
  - `404 Not Found`: Resume does not exist or unauthorized.

---

### 7.6 Delete Resume
- **HTTP Method:** `DELETE`
- **Endpoint:** `/api/resumes/:id`
- **Description:** Permanently deletes a resume, its uploaded disk assets, and associated version history snapshots.
- **Authentication:** Required.
- **Path Parameters:**
  - `id` *(string, required)*: MongoDB ObjectId.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "674b1c2d3e4f5a6b7c8d9e0f"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Malformed ID.
  - `404 Not Found`: Resume not found.

---

### 7.7 Print Preview Data
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes/:id/print-preview` *(Alias: `/api/resumes/:id/print-data`)*
- **Description:** Exposes resume parsedData and theme settings for headless Puppeteer rendering and direct browser printing.
- **Authentication:** Dual mode:
  - Standard session cookie / Bearer token, OR
  - Query parameter token: `?token=<short_lived_token>`.
- **Path Parameters:**
  - `id` *(string, required)*: MongoDB ObjectId.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "resume": {
        "_id": "674b1c2d3e4f5a6b7c8d9e0f",
        "template": "modern-clean",
        "parsedData": { ... }
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Missing or expired authentication token.
  - `404 Not Found`: Resume not found.

---

### 7.8 Export High-Resolution PDF
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes/:id/pdf` *(Alias: `/api/resumes/:id/export/pdf`)*
- **Description:** Uses headless Puppeteer to render true-to-preview A4 PDF document with print stylesheet parity.
- **Authentication:** Required.
- **Query Parameters:**
  - `density` *(string, optional, e.g. `density-1`, `density-compact`)*: Vertical spacing rhythm.
  - `theme` *(string, optional, JSON encoded)*: Color/font overrides.
- **Successful Response (`200 OK`):** Binary stream (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Resume.pdf"`).
- **Error Responses:**
  - `404 Not Found`: Resume not found.
  - `500 Internal Server Error`: Puppeteer print rendering error.

---

## 8. Resume Versioning

### 8.1 List Resume Versions
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes/:id/versions`
- **Description:** Returns historical snapshots of the resume created across edits and optimizations.
- **Authentication:** Required.
- **Path Parameters:**
  - `id` *(string, required)*: Resume ObjectId.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "versions": [
        {
          "_id": "674c2d3e4f5a6b7c8d9e0f11",
          "resume": "674b1c2d3e4f5a6b7c8d9e0f",
          "name": "Version 1",
          "createdAt": "2026-09-30T11:00:00.000Z"
        }
      ]
    }
  }
  ```

---

### 8.2 Get Specific Version Snapshot
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resumes/:id/versions/:versionId`
- **Description:** Retrieves the exact saved parsedData state of a specific snapshot version.
- **Authentication:** Required.

---

### 8.3 Revert Resume to Historical Version
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes/:id/versions/:versionId/revert` *(Alias: `.../restore`)*
- **Description:** Overwrites the active resume's content with the snapshot data from the specified version.
- **Authentication:** Required.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Resume restored to version",
    "data": {
      "resume": { ... }
    }
  }
  ```

---

### 8.4 Clone Version as New Resume
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes/:id/versions/:versionId/clone` *(Alias: `.../duplicate`)*
- **Description:** Clones a historical snapshot into an independent top-level resume document.
- **Authentication:** Required.
- **Successful Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "version": { ... }
    }
  }
  ```

---

## 9. Job Description Management

### 9.1 List User Job Descriptions
- **HTTP Method:** `GET`
- **Endpoint:** `/api/job-descriptions` *(Alias: `/api/jds`)*
- **Description:** Returns stored job descriptions for the authenticated user with pagination.
- **Authentication:** Required.
- **Query Parameters:**
  - `page` *(optional, integer, default: `1`)*.
  - `limit` *(optional, integer, default: `20`)*.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "jds": [
        {
          "_id": "674d3e4f5a6b7c8d9e0f1122",
          "title": "Principal Architect",
          "company": "Acquired Tech",
          "skills": ["React", "Node.js", "Docker"],
          "experienceRequired": "5+ years",
          "createdAt": "2026-09-30T12:00:00.000Z"
        }
      ],
      "pagination": { "total": 1, "page": 1, "limit": 20, "pages": 1 }
    }
  }
  ```

---

### 9.2 Create Job Description
- **HTTP Method:** `POST`
- **Endpoint:** `/api/job-descriptions` *(Alias: `/api/jds`)*
- **Description:** Accepts raw text or uploaded PDF/DOCX job description document, analyzes role requirements, and extracts keywords.
- **Authentication:** Required.
- **Request Body (JSON Mode):**
  ```json
  {
    "text": "Senior Software Engineer at TestCorp. Required skills: Node.js, React, Docker..."
  }
  ```
  *(Or `multipart/form-data` with `jd` file field)*
- **Successful Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "jd": {
        "_id": "674d3e4f5a6b7c8d9e0f1122",
        "title": "Senior Software Engineer",
        "company": "TestCorp",
        "skills": ["Node.js", "React", "Docker"],
        "responsibilities": ["Lead microservices architecture"]
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Empty text or unreadable document.
  - `401 Unauthorized`: Not authenticated.

---

### 9.3 Get Job Description by ID
- **HTTP Method:** `GET`
- **Endpoint:** `/api/job-descriptions/:id` *(Alias: `/api/jds/:id`)*
- **Description:** Retrieves structured JD details.
- **Authentication:** Required.

---

### 9.4 Update Job Description
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/job-descriptions/:id` *(Alias: `/api/jds/:id`)*
- **Description:** Updates JD metadata, company, title, or skills using safe `$set` operations. Ownership tampering is rejected.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "title": "Staff Engineer",
    "company": "Global Solutions Ltd"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "jd": {
        "_id": "674d3e4f5a6b7c8d9e0f1122",
        "title": "Staff Engineer",
        "company": "Global Solutions Ltd"
      }
    }
  }
  ```

---

### 9.5 Delete Job Description
- **HTTP Method:** `DELETE`
- **Endpoint:** `/api/job-descriptions/:id` *(Alias: `/api/jds/:id`)*
- **Description:** Removes stored job description.
- **Authentication:** Required.

---

## 10. AI Resume Optimization & Tailoring

### 10.1 Run Resume Optimization
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resume-optimizations` *(Alias: `/api/optimizations`)*
- **Description:** Triggers Google Gemini AI comparison between a target resume and JD. Generates match percentage, keyword analysis, and customized bullet rewrites.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "resumeId": "674b1c2d3e4f5a6b7c8d9e0f",
    "jdId": "674d3e4f5a6b7c8d9e0f1122"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "optimization": {
        "_id": "674e4f5a6b7c8d9e0f112233",
        "resume": "674b1c2d3e4f5a6b7c8d9e0f",
        "jd": "674d3e4f5a6b7c8d9e0f1122",
        "matchScore": 88,
        "matchedSkills": ["Node.js", "React", "Docker"],
        "missingSkills": ["Kubernetes", "GraphQL"],
        "suggestions": [
          "Incorporate microservices metrics into experience bullet points."
        ]
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid resumeId or jdId.
  - `429 Too Many Requests`: AI rate limit reached.
  - `502 Bad Gateway`: AI returned unparseable output.
  - `504 Gateway Timeout`: AI provider timed out.

---

### 10.2 List User Optimizations
- **HTTP Method:** `GET`
- **Endpoint:** `/api/resume-optimizations` *(Alias: `/api/optimizations`)*
- **Description:** Retrieves paginated optimization history for the authenticated user.
- **Authentication:** Required.

---

### 10.3 Generate Tailored Resume Variant
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes/:id/tailored-variants` *(Alias: `/api/resumes/:id/generate`)*
- **Description:** Produces an AI-optimized variant of an existing resume, specifically targeted to a JD.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "jdId": "674d3e4f5a6b7c8d9e0f1122",
    "targetRole": "Senior DevOps Engineer"
  }
  ```
- **Successful Response (`201 Created`):** Returns new Resume document with optimized bullet points and tracked `aiChanges`.

---

### 10.4 Generate Resume from Job Description
- **HTTP Method:** `POST`
- **Endpoint:** `/api/resumes/from-job-description` *(Alias: `/api/resumes/generate-from-jd`)*
- **Description:** Synthesizes a new tailored resume directly from job description text or document.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "jdId": "674d3e4f5a6b7c8d9e0f1122",
    "template": "tech-engineer-clean"
  }
  ```
- **Successful Response (`201 Created`):** Returns newly generated tailored resume.

---

## 11. ATS Scorecard & Keyword Analysis

### 11.1 Evaluate ATS Scorecard
- **HTTP Method:** `POST`
- **Endpoint:** `/api/ats-evaluations` *(Alias: `/api/ats/check`)*
- **Description:** Instant, deterministic ATS compatibility evaluation (no external AI call). Checks structure, section headings, length, keyword density, and matched/missing skills against an optional JD.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "resumeId": "674b1c2d3e4f5a6b7c8d9e0f",
    "jdId": "674d3e4f5a6b7c8d9e0f1122"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "atsScore": 92,
      "structureScore": 95,
      "matchPercent": 87,
      "keywordDensity": 4.2,
      "matchedSkills": ["Node.js", "React", "Docker", "PostgreSQL"],
      "missingSkills": ["Kubernetes"],
      "checklist": [
        { "label": "Contact Information Complete", "ok": true, "hint": "Phone and email detected" },
        { "label": "Standard Section Headings", "ok": true, "hint": "Recognized by ATS parsers" },
        { "label": "Bullet Point Formatting", "ok": true, "hint": "Action-verb oriented" }
      ],
      "totalWords": 465
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Missing or invalid resumeId.
  - `404 Not Found`: Resume or JD not found.

---

## 12. AI In-Editor Assistant & Suggestions

### 12.1 Rewrite Resume Section
- **HTTP Method:** `POST`
- **Endpoint:** `/api/ai/section-rewrites` *(Alias: `/api/ai/assist`)*
- **Description:** Real-time AI section rewriting (summary, experience bullets, project descriptions) with specific tone and length adjustments.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "section": "experience",
    "action": "professional",
    "content": "Worked on backend microservices and helped make them faster."
  }
  ```
  *(Supported actions: `improve`, `shorten`, `expand`, `rewrite`, `professional`, `technical`, `entry`, `senior`, `executive`)*
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "result": "Architected and optimized distributed microservices, improving throughput and reducing P99 latency by 35%."
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid section or action name.
  - `429 Too Many Requests`: AI rate limits.

---

### 12.2 Smart Content Addition Suggestions
- **HTTP Method:** `POST`
- **Endpoint:** `/api/ai/content-suggestions` *(Alias: `/api/ai/suggestions`)*
- **Description:** Editor-time intelligence providing JD-aware "What else should I add?" recommendations.
- **Authentication:** Required.
- **Request Body:**
  ```json
  {
    "resumeId": "674b1c2d3e4f5a6b7c8d9e0f",
    "jdId": "674d3e4f5a6b7c8d9e0f1122"
  }
  ```
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "suggestions": [
        {
          "type": "add-skill",
          "section": "skills",
          "field": "skills",
          "value": "Docker",
          "detail": "Docker is mentioned 3 times in the target job description.",
          "reason": "High keyword frequency in JD"
        }
      ]
    }
  }
  ```

---

## 13. Notification Services

### 13.1 List Notifications
- **HTTP Method:** `GET`
- **Endpoint:** `/api/notifications`
- **Description:** Retrieves paginated notification stream for the user.
- **Authentication:** Required.
- **Query Parameters:** `page` *(optional, integer, default: `1`)*.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "_id": "674f5a6b7c8d9e0f11223344",
          "title": "Optimization Complete",
          "body": "Your resume was successfully tailored for Senior Full Stack Engineer.",
          "type": "success",
          "read": false,
          "createdAt": "2026-09-30T14:00:00.000Z"
        }
      ],
      "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
    }
  }
  ```

---

### 13.2 Mark All Notifications as Read
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/notifications` *(Alias: `/api/notifications/read-all`)*
- **Description:** Marks all active notifications as read for current user.
- **Authentication:** Required.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "data": null
  }
  ```

---

### 13.3 Mark Single Notification as Read
- **HTTP Method:** `PATCH`
- **Endpoint:** `/api/notifications/:id` *(Alias: `/api/notifications/:id/read`)*
- **Description:** Marks a single notification as read by ID.
- **Authentication:** Required.
- **Path Parameters:**
  - `id` *(string, required)*: Notification ObjectId.
- **Successful Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": null
  }
  ```

---

## 14. Backward Compatibility Matrix

All legacy endpoints remain actively routed on the backend to guarantee seamless zero-downtime operations during concurrent frontend and backend deployments:

| Canonical Route (V2) | Legacy Alias (V1) | HTTP Method | Compatibility Layer |
| :--- | :--- | :--- | :--- |
| `/api/job-descriptions` | `/api/jds` | `GET`, `POST` | Dual Express Router Mount |
| `/api/job-descriptions/:id` | `/api/jds/:id` | `GET`, `PATCH`, `DELETE` | Dual Express Router Mount |
| `/api/resume-optimizations` | `/api/optimizations` | `GET`, `POST` | Dual Express Router Mount |
| `/api/resume-optimizations/:id` | `/api/optimizations/:id` | `GET`, `DELETE` | Dual Express Router Mount |
| `/api/ats-evaluations` | `/api/ats/check` | `POST` | Dual Express Router Mount |
| `/api/resumes/templates/blank` | `/api/resumes/blank`, `/api/resumes/scratch` | `POST` | Dual Route Handler |
| `/api/resumes/from-job-description` | `/api/resumes/generate-from-jd` | `POST` | Dual Route Handler |
| `/api/resumes/:id/tailored-variants` | `/api/resumes/:id/generate` | `POST` | Dual Route Handler |
| `/api/resumes/:id/print-preview` | `/api/resumes/:id/print-data` | `GET` | Dual Route Handler |
| `/api/resumes/:id/pdf` | `/api/resumes/:id/export/pdf` | `GET` | Dual Route Handler |
| `/api/resumes/:id/versions/:vId/revert`| `.../restore` | `POST` | Dual Route Handler |
| `/api/resumes/:id/versions/:vId/clone` | `.../duplicate` | `POST` | Dual Route Handler |
| `/api/ai/status` | `/api/ai/health`, `/api/ai/ping` | `GET` | Dual Route Handler |
| `/api/ai/section-rewrites` | `/api/ai/assist` | `POST` | Dual Route Handler |
| `/api/ai/content-suggestions` | `/api/ai/suggestions` | `POST` | Dual Route Handler |
| `PATCH /api/notifications` | `PATCH /api/notifications/read-all` | `PATCH` | Dual Route Handler |
| `PATCH /api/notifications/:id` | `PATCH /api/notifications/:id/read` | `PATCH` | Dual Route Handler |
| `/uploads/job-descriptions` | `/uploads/jds` | `GET` | Dual Static Directory Mount |
