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
  {
    "success": true,
    "data": {
      "portfolios": [
        {
          "_id": "671ad1a9e4b02a1234567890",
          "title": "Candidate Portfolio",
          "slug": "candidate-portfolio",
          "status": "published",
          "design": {
            "template": "spotlight",
            "theme": "light",
            "primaryColor": "#e3141f",
            "fontFamily": "Inter"
          },
          "publication": {
            "isPublic": true,
            "publishedAt": "2026-10-25T12:00:00.000Z",
            "seoTitle": "Candidate Portfolio",
            "seoDescription": "Full Stack Engineer & Creative Developer"
          },
          "updatedAt": "2026-10-25T12:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1
      }
    }
  }
  ```

### 2. Create Portfolio
- **Route:** `POST /api/portfolios`
- **Auth:** Bearer Token (JWT)
- **Payload:**
  ```json
  {
    "title": "Candidate Portfolio",
    "resumeId": "671ad1a9e4b02a1234567891",
    "design": {
      "template": "spotlight"
    }
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
- **Route:** `PATCH /api/portfolios/:id`
- **Auth:** Bearer Token (JWT)

### 6. Publish Portfolio
- **Route:** `POST /api/portfolios/:id/publish`
- **Payload:**
  ```json
  {
    "slug": "candidate-portfolio",
    "seoTitle": "Candidate Portfolio",
    "seoDescription": "Full Stack Engineer & Creative Developer"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "portfolio": {
        "_id": "671ad1a9e4b02a1234567890",
        "slug": "candidate-portfolio",
        "status": "published",
        "publication": {
          "isPublic": true,
          "publishedAt": "2026-10-25T12:00:00.000Z",
          "seoTitle": "Candidate Portfolio",
          "seoDescription": "Full Stack Engineer & Creative Developer"
        }
      }
    }
  }
  ```

### 7. Public Fetch by Slug
- **Route:** `GET /api/portfolios/public/:slug`
- **Auth:** None (Public Endpoint)
