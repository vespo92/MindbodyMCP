# Examples

This directory contains examples of how to use the Mindbody MCP Server in various scenarios.

## Basic Usage

### Get a Teacher's Weekly Schedule

```typescript
// Ask Claude:
"Show me Alexia Bauer's schedule for this week"

// Response will include:
// - All classes taught by Alexia
// - Class times and durations
// - Location information
// - Available spots
// - Summary by day and class type
```

### Check Tomorrow's Classes

```typescript
// Ask Claude:
"What yoga classes is Sarah Johnson teaching tomorrow?"

// The tool will:
// 1. Find Sarah Johnson in the system
// 2. Filter for tomorrow's date
// 3. Return only yoga classes
```

### Date Range Queries

```typescript
// Ask Claude:
"Get John Smith's schedule from March 15 to March 22"

// Specific date ranges are supported
// Dates should be in YYYY-MM-DD format
```

## Advanced Usage

### Building a Weekly Schedule Display

```javascript
// Frontend integration example
async function displayWeeklySchedule(teacherName) {
  // Claude will return structured data like:
  const schedule = {
    teacher: {
      id: 12345,
      name: "Alexia Bauer",
      email: "alexia@studio.com"
    },
    dateRange: {
      start: "2024-03-18",
      end: "2024-03-25"
    },
    totalClasses: 12,
    classes: [
      {
        id: 98765,
        name: "Vinyasa Flow",
        startTime: "2024-03-18T09:00:00",
        endTime: "2024-03-18T10:15:00",
        duration: 75,
        location: "Main Studio",
        isSubstitute: false,
        isCanceled: false,
        spotsAvailable: 5,
        totalSpots: 20
      }
      // ... more classes
    ],
    summary: {
      byDay: {
        "Monday": 2,
        "Wednesday": 2,
        "Friday": 3
      },
      byLocation: {
        "Main Studio": 8,
        "Yoga Room": 4
      },
      byClassType: {
        "Vinyasa Flow": 6,
        "Yin Yoga": 4,
        "Power Yoga": 2
      }
    }
  };
  
  // Use this data to build your UI
}
```

### Substitution Workflow (Coming Soon)

```typescript
// Step 1: Find who needs coverage
"Show me all classes that need substitutes this week"

// Step 2: Find available teachers
"Who can substitute for the 9am Vinyasa class on Tuesday?"

// Step 3: Create substitution
"Assign Sarah as substitute for Tuesday's 9am Vinyasa class"
```

### Bulk Operations (Coming Soon)

```typescript
// Get multiple teachers at once
"Show me the schedules for all yoga teachers this week"

// Export for payroll
"Export teaching hours for all instructors last month"
```

## Integration Patterns

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function TeacherSchedule({ teacherName }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would call your backend
    // which uses the MCP server
    fetchSchedule(teacherName).then(data => {
      setSchedule(data);
      setLoading(false);
    });
  }, [teacherName]);

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="schedule">
      <h2>{schedule.teacher.name}'s Schedule</h2>
      <p>{schedule.totalClasses} classes this week</p>
      
      {schedule.classes.map(cls => (
        <div key={cls.id} className="class-card">
          <h3>{cls.name}</h3>
          <p>{new Date(cls.startTime).toLocaleString()}</p>
          <p>{cls.location}</p>
          <p>{cls.spotsAvailable} spots available</p>
        </div>
      ))}
    </div>
  );
}
```

### Error Handling

```typescript
// The MCP server provides clear error messages:

// Teacher not found
"Get schedule for John Doe"
// Error: Teacher "John Doe" not found. Please check the spelling and try again.

// Invalid date range
"Get schedule from tomorrow to yesterday"
// Error: Invalid date range. End date must be after start date.

// API issues
// Error: Mindbody API Error: Rate limit exceeded (Code: 429)
```

## Best Practices

1. **Cache Responses**: The server caches for 5 minutes, but you can add client-side caching too
2. **Batch Requests**: When possible, request larger date ranges instead of day-by-day
3. **Handle Errors**: Always handle the possibility of teachers not found or API errors
4. **Use Summaries**: The summary data is perfect for dashboards and quick views
5. **Check Cancellations**: Always check the `isCanceled` flag before displaying classes

## Coming Soon

- WebSocket support for real-time updates
- Webhook integration for class changes
- CSV/iCal export formats
- Multi-language support
