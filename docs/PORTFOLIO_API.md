# Portfolio REST API Documentation

## Overview
The Portfolio API manages lifecycle, career content extraction, theme customization, and public web hosting of portfolio instances.

### Base URL
- Development: `http://localhost:5001/api/portfolios`
- Production: `/api/portfolios`

---

## Endpoints

### 1. List Portfolios
- **Route:** `GET /api/portfolios`
- **Auth:** Bearer Token (JWT)
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "671...",
      "title": "Sunil's Portfolio",
      "slug": "sunil-kumar",
      "status": "published",
      "design": {
        "template": "spotlight",
        "theme": "light",
        "primaryColor": "#e3141f"
      },
      "updatedAt": "2026-10-25T12:00:00.000Z"
    }
  ]
  ```

### 2. Create Portfolio
- **Route:** `POST /api/portfolios`
- **Auth:** Bearer Token (JWT)
- **Payload:**
  ```json
  {
    "title": "Sunil's Portfolio",
    "resumeId": "optional-resume-id",
    "template": "spotlight"
  }
  ```

### 3. Upload & Extract Resume
- **Route:** `POST /api/portfolios/upload`
- **Auth:** Bearer Token (JWT)
- **Body:** `multipart/form-data` with `file` (PDF/DOCX)

### 4. Get Portfolio by ID
- **Route:** `GET /api/portfolios/:id`
- **Auth:** Bearer Token (JWT)

### 5. Update / Autosave Portfolio
- **Route:** `PUT /api/portfolios/:id`
- **Auth:** Bearer Token (JWT)

### 6. Publish Portfolio
- **Route:** `POST /api/portfolios/:id/publish`
- **Payload:** `{ "isPublic": true, "slug": "sunilkumar25kush" }`

### 7. Public Fetch by Slug
- **Route:** `GET /api/portfolios/public/:slug`
- **Auth:** None (Public Endpoint)
