# API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

### Register

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

**Errors:**
- `400`: Email already exists or validation failed
- `500`: Registration failed

---

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

**Errors:**
- `401`: Invalid credentials
- `500`: Login failed

---

## User Profile

### Get Profile

**GET** `/users/profile`

Retrieve authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "thesis_topic": "My IPA Project",
  "submission_date": "2024-06-30",
  "onboarding_completed": true,
  "email": "user@example.com"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Profile not found

---

### Update Profile

**PUT** `/users/profile`

Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "thesisTopic": "My Updated IPA Project",
  "submissionDate": "2024-06-30",
  "onboardingCompleted": true
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "thesis_topic": "My Updated IPA Project",
  "submission_date": "2024-06-30T00:00:00.000Z",
  "onboarding_completed": true,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-16T14:20:00.000Z"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Profile not found

---

## Evaluations

### Get All Criteria

**GET** `/evaluations/criteria`

Retrieve all evaluation criteria from the JSON file.

**Response:** `200 OK`
```json
{
  "categories_with_weigth": [
    {
      "id": "hkb",
      "name": "Handlungskompetenzen",
      "weight": 0.5
    }
  ],
  "criterias": [
    {
      "id": "A01",
      "category": "hkb",
      "title": "Auftragsanalyse und Wahl einer Projektmethode",
      "subtitle": "Wie erfolgt die Auftragsanalyse?",
      "requirements": [
        "Der Projektauftrag wurde analysiert..."
      ],
      "stages": {
        "3": { "all": true },
        "2": { "count": 3 },
        "1": { "count": 2 },
        "0": { "count_less_than": 2 }
      }
    }
  ]
}
```

---

### Get User Evaluations

**GET** `/evaluations`

Get all criteria with user's evaluation progress.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "categories": [
    {
      "id": "hkb",
      "name": "Handlungskompetenzen",
      "weight": 0.5
    }
  ],
  "criterias": [
    {
      "id": "A01",
      "category": "hkb",
      "title": "Auftragsanalyse und Wahl einer Projektmethode",
      "subtitle": "Wie erfolgt die Auftragsanalyse?",
      "requirements": [...],
      "stages": {...},
      "evaluation": {
        "id": 1,
        "user_id": 1,
        "criteria_id": "A01",
        "fulfilled_requirements": {
          "0": true,
          "1": true,
          "2": false
        },
        "notes": "Some notes",
        "selected_option": null,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-16T14:20:00.000Z"
      }
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized

---

### Save Evaluation

**POST** `/evaluations/:criteriaId`

Save or update evaluation for a specific criteria.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `criteriaId`: The criteria ID (e.g., "A01", "B02")

**Request Body:**

For criteria with checkboxes:
```json
{
  "fulfilledRequirements": {
    "0": true,
    "1": false,
    "2": true,
    "3": true
  },
  "notes": "Additional notes about this criteria"
}
```

For criteria with single selection (e.g., "F&P05"):
```json
{
  "selectedOption": 2,
  "notes": "Selected option 2"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "criteria_id": "A01",
  "fulfilled_requirements": {
    "0": true,
    "1": false,
    "2": true,
    "3": true
  },
  "notes": "Additional notes",
  "selected_option": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-16T14:20:00.000Z"
}
```

**Errors:**
- `401`: Unauthorized
- `404`: Criteria not found

---

### Calculate Scores

**GET** `/evaluations/calculate`

Calculate weighted scores and final grade based on all evaluations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "categoryScores": {
    "hkb": {
      "name": "Handlungskompetenzen",
      "weight": 0.5,
      "score": 2.75,
      "weightedScore": 1.375
    },
    "dok": {
      "name": "Dokumentation",
      "weight": 0.2,
      "score": 3.0,
      "weightedScore": 0.6
    },
    "fpd": {
      "name": "Fachgespräch und Präsentation (inkl. Demo)",
      "weight": 0.3,
      "score": 2.5,
      "weightedScore": 0.75
    }
  },
  "totalScore": 2.725,
  "finalGrade": 2.7
}
```

**Grade Calculation Logic:**

For each criteria:
1. Check fulfilled requirements or selected option
2. Match against stages to determine grade (0-3)
3. Calculate category average
4. Apply category weight
5. Sum weighted scores for final grade

**Errors:**
- `401`: Unauthorized

---

## Health Check

**GET** `/health`

Check if the server is running.

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "error": "Description of validation error"
}
```

**401 Unauthorized**
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid token"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## CORS

CORS is enabled for all origins in development. Configure specific origins for production.

## Data Types

### Evaluation Storage

Fulfilled requirements are stored as JSON:
```json
{
  "0": true,  // First requirement fulfilled
  "1": false, // Second requirement not fulfilled
  "2": true   // Third requirement fulfilled
}
```

### Dates

Dates are stored in ISO 8601 format: `2024-06-30T00:00:00.000Z`

### Grades

Grades are integers from 0 to 3:
- 0: Insufficient
- 1: Partially met
- 2: Mostly met
- 3: Fully met

Final grade is calculated as weighted average (0-3 scale).
