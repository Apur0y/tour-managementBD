# Profile Management API Documentation

This document describes the profile edit and password change APIs implemented for the tour management system.

## Authentication Required
Both APIs require user authentication via JWT token. The token should be included in cookies (`accessToken`) or Authorization header.

## 1. Profile Update API

### Endpoint
```
PUT /api/v1/profile
```

### Description
Updates user profile information including name, phone, address, and optionally uploads a profile picture.

### Content Type
```
multipart/form-data
```

### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | User's full name (minimum 1 character) |
| phone | string | No | User's phone number |
| address | string | No | User's address |
| picture | file | No | Profile picture (image files only, max 5MB) |

### Example Request (using curl)
```bash
curl -X PUT "http://localhost:5000/api/v1/profile" \
  -H "Cookie: accessToken=your_jwt_token_here" \
  -F "name=John Doe" \
  -F "phone=+1234567890" \
  -F "address=123 Main Street, City, Country" \
  -F "picture=@/path/to/profile-image.jpg"
```

### Example Request (using JavaScript/FormData)
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('phone', '+1234567890');
formData.append('address', '123 Main Street, City, Country');
formData.append('picture', fileInput.files[0]); // from <input type="file">

fetch('/api/v1/profile', {
  method: 'PUT',
  credentials: 'include', // Include cookies
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, City, Country",
    "picture": "/uploads/profiles/profile-1234567890-123456789.jpg",
    "role": "USER",
    "isActive": "ACTIVE",
    "isVerified": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Error Responses
- **401 Unauthorized**: User not authenticated
- **400 Bad Request**: Invalid file type, file too large, or validation errors
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

## 2. Password Change API

### Endpoint
```
PUT /api/v1/change-password
```

### Description
Changes the user's password after verifying the current password.

### Content Type
```
application/json
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | Yes | User's current password |
| newPassword | string | Yes | New password (minimum 6 characters) |
| confirmPassword | string | Yes | Confirmation of new password (must match newPassword) |

### Example Request (using curl)
```bash
curl -X PUT "http://localhost:5000/api/v1/change-password" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_jwt_token_here" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }'
```

### Example Request (using JavaScript)
```javascript
fetch('/api/v1/change-password', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    currentPassword: 'oldPassword123',
    newPassword: 'newPassword456',
    confirmPassword: 'newPassword456'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password changed successfully!"
}
```

### Error Responses
- **401 Unauthorized**: User not authenticated or current password incorrect
- **400 Bad Request**: Validation errors, passwords don't match, or new password same as current
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

## File Upload Details

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

### File Restrictions
- Maximum file size: 5MB
- Only image files are allowed
- Files are stored in `uploads/profiles/` directory
- Uploaded files are accessible via `/uploads/profiles/filename.ext`

### File Naming Convention
Profile pictures are automatically renamed using the pattern:
```
profile-{timestamp}-{random}.{original_extension}
```

Example: `profile-1672531200000-123456789.jpg`

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errorDetails": {
    "issues": [
      {
        "path": ["newPassword"],
        "message": "New password must be at least 6 characters"
      }
    ]
  }
}
```

### File Upload Errors (400)
```json
{
  "success": false,
  "message": "File too large. Maximum size allowed is 5MB."
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

## Security Features

1. **JWT Authentication**: Both endpoints require valid JWT tokens
2. **File Type Validation**: Only image files are accepted for profile pictures
3. **File Size Limits**: Maximum 5MB for uploaded images
4. **Password Verification**: Current password must be verified before changing
5. **Password Complexity**: New passwords must be at least 6 characters
6. **Path Traversal Protection**: Files are stored in designated upload directory
7. **Unique Filenames**: Prevents file conflicts and information disclosure

## Testing

### Test Profile Update
```bash
# First login to get token
curl -X POST "http://localhost:5000/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Then update profile (cookie will be set automatically)
curl -X PUT "http://localhost:5000/api/v1/profile" \
  -H "Cookie: accessToken=your_token_here" \
  -F "name=Updated Name" \
  -F "phone=+1234567890"
```

### Test Password Change
```bash
curl -X PUT "http://localhost:5000/api/v1/change-password" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_token_here" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }'
```
