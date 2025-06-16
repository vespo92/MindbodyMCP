# Claude.md - AI Assistant Instructions

## Overview
This is the Mindbody MCP Server - a Model Context Protocol server that provides AI assistants with tools to interact with the Mindbody API for fitness/wellness studio management.

## Core Capabilities
- Query teacher schedules and availability
- Manage class substitutions with AI-powered recommendations
- Update events and class information
- Provide data for beautiful frontend integrations
- Support role-based access for different staff levels

## Available Tools

### `getTeacherSchedule`
Retrieves a teacher's class schedule for a specified date range.

**Parameters:**
- `teacherName` (required): The teacher's full name
- `startDate` (optional): Start date in YYYY-MM-DD format (defaults to today)
- `endDate` (optional): End date in YYYY-MM-DD format (defaults to 7 days from start)

**Returns:** Structured schedule data including:
- Teacher information (ID, name, email)
- List of classes with times, locations, and availability
- Summary statistics by day, location, and class type

**Example usage:**
```
"Get Alexia Bauer's schedule for next week"
"Show me what John Smith is teaching tomorrow"
"List all of Sarah's yoga classes this month"
```

## Architecture Notes

### Performance
- Uses Bun runtime for 4x faster startup (critical for MCP servers)
- Implements intelligent caching (5-min for classes, 60-min for teacher data)
- Automatic retry logic with exponential backoff
- Rate limit aware (2000 requests/hour Mindbody limit)

### Authentication
- OAuth 2.0 token management with automatic refresh
- Credentials stored securely via environment variables
- Token caching to minimize auth requests

### Error Handling
- Clear, user-friendly error messages
- Graceful degradation on API failures
- Detailed logging for debugging

## Development Guidelines

### Adding New Tools
1. Create tool file in `src/tools/` following existing patterns
2. Register in `src/index.ts` (both ListTools and CallTool handlers)
3. Add TypeScript types to `src/types/mindbody.ts`
4. Update this file with tool documentation

### Code Style
- TypeScript with strict mode
- Async/await for all API calls
- Comprehensive error handling
- Clear function and variable names

### Testing
- Use `bun run test:tool` to test individual tools
- Verify with actual Mindbody sandbox before production
- Test edge cases (teacher not found, no classes, API errors)

## Common Patterns

### Date Handling
```typescript
// Always accept flexible date formats from users
// Convert to YYYY-MM-DD for API calls
// Default to sensible ranges (today + 7 days)
```

### Caching Strategy
```typescript
// Cache keys: "type:identifier:daterange"
// Teacher data: 60 minutes (rarely changes)
// Class data: 5 minutes (bookings change frequently)
// Clear cache on write operations
```

### Response Formatting
```typescript
// Return structured data for AI parsing
// Include summaries for quick insights
// Maintain consistent property names
```

## Troubleshooting

### Common Issues
1. **"Teacher not found"** - Check exact spelling, try partial matches
2. **401 Unauthorized** - Token expired, will auto-refresh
3. **Rate limit** - Caching should prevent this, increase TTL if needed
4. **Empty results** - Check date ranges, teacher might have no classes

### Debug Mode
Set `DEBUG=true` in environment to enable verbose logging.

## Future Enhancements
- Fuzzy teacher name matching
- Bulk operations for efficiency
- Webhook support for real-time updates
- Advanced substitution AI recommendations
- Multi-site support

## Security Considerations
- Never log credentials or tokens
- Sanitize user inputs before API calls
- Validate date ranges to prevent abuse
- Implement request throttling if needed

## Integration Tips
- Frontend devs can use the structured JSON responses directly
- Consider implementing GraphQL layer for complex queries
- WebSocket support planned for real-time updates
- Export formats available (CSV, iCal) in future versions
