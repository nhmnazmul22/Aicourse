# Database Schema

## Collections

### User

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| _id | ObjectId | Yes | PK | Auto-generated |
| email | String | Yes | unique | User's email (lowercased) |
| name | String | Yes | | Full name |
| companyname | String | No | | Optional company name |
| passwordHash | String | Yes | | bcrypt hash |
| avatarUrl | String | No | | Optional avatar URL |
| createdAt | Date | Yes | | Auto timestamp |
| updatedAt | Date | Yes | | Auto timestamp |

### Project

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| _id | ObjectId | Yes | PK | Auto-generated |
| name | String | Yes | | Project name (max 100 chars) |
| userId | ObjectId | Yes | userId+name unique | References User |
| createdAt | Date | Yes | | Auto timestamp |
| updatedAt | Date | Yes | | Auto timestamp |

### BoardColumn

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| _id | ObjectId | Yes | PK | Auto-generated |
| name | String | Yes | | Column name (max 50 chars) |
| projectId | ObjectId | Yes | projectId+position | References Project |
| position | Number | Yes | | Column order (0-4 for 5 fixed columns) |
| createdAt | Date | Yes | | Auto timestamp |
| updatedAt | Date | Yes | | Auto timestamp |

### Card

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| _id | ObjectId | Yes | PK | Auto-generated |
| title | String | Yes | | Card title (max 200 chars) |
| details | String | No | | Card details |
| columnId | ObjectId | Yes | columnId+position | References BoardColumn |
| position | Number | Yes | | Card order within column |
| createdAt | Date | Yes | | Auto timestamp |
| updatedAt | Date | Yes | | Auto timestamp |

## Relationships

```
User 1:N Project          (userId → User._id)
Project 1:N BoardColumn   (projectId → Project._id)
BoardColumn 1:N Card      (columnId → BoardColumn._id)
```

All data is user-scoped. A user can only access their own projects, columns, and cards through the `userId` on Project and the chain through Project → BoardColumn → Card.

## Indexes

- `User.email` — unique
- `Project(userId, name)` — unique (prevents duplicate project names per user)
- `BoardColumn(projectId, position)` — column ordering within a project
- `Card(columnId, position)` — card ordering within a column

## User Scoping

Every board/task route is scoped to the current authenticated user via the JWT `userId` claim. Queries always filter by `userId` (directly on Project, or transitively through Project → BoardColumn → Card).
