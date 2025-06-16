# API Reference

## Tools

### getTeacherSchedule

Retrieves a teacher's class schedule for a specified date range.

#### Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `teacherName` | string | Yes | Full name of the teacher | - |
| `startDate` | string | No | Start date (YYYY-MM-DD) | Today |
| `endDate` | string | No | End date (YYYY-MM-DD) | 7 days from start |

#### Response

```typescript
interface TeacherSchedule {
  teacher: {
    id: number;
    name: string;
    email?: string;
  };
  dateRange: {
    start: string;  // YYYY-MM-DD
    end: string;    // YYYY-MM-DD
  };
  totalClasses: number;
  classes: Array<{
    id: number;
    name: string;
    startTime: string;      // ISO 8601 datetime
    endTime: string;        // ISO 8601 datetime
    duration: number;       // minutes
    location: string;
    isSubstitute: boolean;
    isCanceled: boolean;
    spotsAvailable: number;
    totalSpots: number;
  }>;
  summary: {
    byDay: Record<string, number>;      // "Monday": 3
    byLocation: Record<string, number>;  // "Main Studio": 5
    byClassType: Record<string, number>; // "Yoga": 8
  };
}
```

#### Examples

```typescript
// Basic usage
await getTeacherSchedule("Alexia Bauer");

// With date range
await getTeacherSchedule("John Smith", "2024-03-15", "2024-03-22");

// Next week
const nextMonday = getNextMonday();
const nextSunday = addDays(nextMonday, 6);
await getTeacherSchedule("Sarah Johnson", nextMonday, nextSunday);
```

#### Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Teacher not found | The specified teacher name doesn't match any staff member | Check spelling, try partial match |
| Invalid date range | End date is before start date | Ensure dates are in correct order |
| API rate limit | Too many requests to Mindbody API | Wait and retry, increase cache TTL |
| Authentication failed | Invalid or expired credentials | Check environment variables |

## Planned Tools

### getClassSchedule (Coming Soon)

Get all classes for a date range, optionally filtered by location or class type.

```typescript
interface GetClassScheduleParams {
  startDate?: string;
  endDate?: string;
  locationIds?: number[];
  classTypeIds?: number[];
  limit?: number;
}
```

### createSubstitution (Coming Soon)

Create a substitute teacher assignment for a class.

```typescript
interface CreateSubstitutionParams {
  classId: number;
  originalTeacherId: number;
  substituteTeacherId: number;
  date: string;
  reason?: string;
}
```

### updateEvent (Coming Soon)

Update class or event details.

```typescript
interface UpdateEventParams {
  eventId: number;
  updates: {
    description?: string;
    capacity?: number;
    location?: number;
    startTime?: string;
  };
}
```

## Type Definitions

### Core Types

```typescript
// Staff member information
interface Staff {
  Id: number;
  FirstName: string;
  LastName: string;
  Name: string;
  Email?: string;
  MobilePhone?: string;
  ImageUrl?: string;
  Bio?: string;
  isMale?: boolean;
}

// Location information
interface Location {
  Id: number;
  Name: string;
  Description?: string;
  Address?: string;
  Address2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
}

// Class description
interface ClassDescription {
  Id: number;
  Name: string;
  Description?: string;
  ImageUrl?: string;
}

// Individual class instance
interface Class {
  Id: number;
  ClassScheduleId: number;
  Location: Location;
  ClassDescription: ClassDescription;
  Staff: Staff;
  StartDateTime: string;
  EndDateTime: string;
  IsCanceled: boolean;
  IsWaitlistAvailable: boolean;
  IsAvailable: boolean;
  IsSubstitute: boolean;
  MaxCapacity: number;
  TotalBooked: number;
  WebCapacity: number;
  TotalBookedWaitlist: number;
}
```

### API Response Types

```typescript
// Pagination information
interface PaginationResponse {
  PaginationResponse: {
    RequestedLimit: number;
    RequestedOffset: number;
    PageSize: number;
    TotalResults: number;
  };
}

// Get classes response
interface GetClassesResponse extends PaginationResponse {
  Classes: Class[];
}

// Get staff response
interface GetStaffResponse extends PaginationResponse {
  StaffMembers: Staff[];
}
```

## Rate Limiting

The Mindbody API has the following rate limits:

- **2000 requests per hour** per site
- **200 results maximum** per request (pagination required for larger sets)

The MCP server implements several strategies to work within these limits:

1. **Response Caching**: 5-minute default cache for class data
2. **Teacher ID Caching**: 60-minute cache for staff lookups
3. **Automatic Retry**: Exponential backoff on rate limit errors
4. **Request Batching**: Fetch maximum results per request

## Authentication

The server uses OAuth 2.0 for authentication:

1. **Initial Token Request**: Uses API key and source credentials
2. **Token Caching**: Tokens cached until 1 minute before expiration
3. **Automatic Refresh**: Expired tokens automatically refreshed
4. **Error Recovery**: 401 errors trigger token refresh

Required credentials:
- `MINDBODY_API_KEY`: Your API key from Mindbody
- `MINDBODY_SITE_ID`: Your site ID (use -99 for sandbox)
- `MINDBODY_SOURCE_NAME`: Source credentials username
- `MINDBODY_SOURCE_PASSWORD`: Source credentials password

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 101 | Invalid credentials | Check API key and source credentials |
| 102 | Invalid site ID | Verify site ID is correct |
| 201 | Teacher not found | Check spelling, ensure teacher is active |
| 301 | Invalid date format | Use YYYY-MM-DD format |
| 401 | Unauthorized | Token expired, will auto-refresh |
| 429 | Rate limit exceeded | Wait and retry, check cache settings |
| 500 | Server error | Retry with exponential backoff |
