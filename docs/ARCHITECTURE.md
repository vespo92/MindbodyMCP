# Architecture

## Overview

The Mindbody MCP Server is built with a modular, layered architecture optimized for performance and maintainability.

```
┌─────────────────┐
│  Claude Desktop │
└────────┬────────┘
         │ MCP Protocol
┌────────▼────────┐
│   MCP Server    │
│   (index.ts)    │
└────────┬────────┘
         │
┌────────▼────────┐
│     Tools       │
│  (tools/*.ts)   │
└────────┬────────┘
         │
┌────────▼────────┐     ┌─────────────┐
│   API Client    │────▶│    Cache    │
│  (api/client)   │     │ (cache/*)   │
└────────┬────────┘     └─────────────┘
         │
┌────────▼────────┐
│      Auth       │
│  (api/auth.ts)  │
└────────┬────────┘
         │
┌────────▼────────┐
│  Mindbody API   │
│   (External)    │
└─────────────────┘
```

## Core Components

### MCP Server Layer (`src/index.ts`)

The entry point that:
- Initializes the MCP server
- Registers available tools
- Handles tool invocation requests
- Manages server lifecycle

Key responsibilities:
- Protocol compliance
- Request routing
- Error handling
- Response formatting

### Tools Layer (`src/tools/`)

Individual tool implementations that:
- Define specific business logic
- Validate inputs
- Call API methods
- Format responses

Design principles:
- Single responsibility per tool
- Consistent error handling
- Type-safe interfaces
- Reusable components

### API Client Layer (`src/api/`)

#### Client (`api/client.ts`)
- HTTP request handling
- Automatic retry logic
- Error formatting
- Request/response interceptors

Features:
- Exponential backoff
- Connection pooling
- Timeout handling
- Error transformation

#### Authentication (`api/auth.ts`)
- OAuth 2.0 token management
- Automatic token refresh
- Credential security
- Header injection

Token lifecycle:
1. Initial authentication
2. Token caching
3. Expiration monitoring
4. Automatic refresh
5. Retry on 401

### Cache Layer (`src/cache/`)

In-memory caching system with:
- TTL-based expiration
- Type-safe storage
- Automatic cleanup
- Multiple cache instances

Cache strategies:
- **Teacher data**: 60-minute TTL (rarely changes)
- **Class data**: 5-minute TTL (bookings change)
- **General data**: 10-minute TTL (default)

### Type System (`src/types/`)

Comprehensive TypeScript definitions:
- Mindbody API types
- Tool response types
- Internal interfaces
- Utility types

Benefits:
- Compile-time safety
- IDE autocomplete
- Self-documenting code
- Easier refactoring

### Utilities (`src/utils/`)

Helper functions for:
- Date manipulation
- Data formatting
- Common operations
- Validation

## Performance Optimizations

### 1. Runtime Choice (Bun)

Using Bun provides:
- 4x faster cold starts
- Native TypeScript execution
- Built-in optimizations
- Lower memory usage

### 2. Caching Strategy

Multi-level caching:
```typescript
// Level 1: Teacher ID cache (60 min)
teacherCache.get(`teacher:${name}`)

// Level 2: Class data cache (5 min)
classCache.get(`classes:${teacherId}:${dateRange}`)

// Level 3: HTTP response cache (axios)
```

### 3. Request Optimization

- Batch API requests where possible
- Use maximum page size (200)
- Parallel requests when safe
- Connection reuse

### 4. Error Recovery

- Automatic retry with backoff
- Token refresh on 401
- Graceful degradation
- Circuit breaker pattern (planned)

## Security Considerations

### 1. Credential Management

- Environment variables only
- No hardcoded secrets
- Secure token storage
- Minimal permission scope

### 2. Input Validation

- Type checking at boundaries
- Date format validation
- SQL injection prevention
- XSS protection

### 3. API Security

- HTTPS only
- Token expiration
- Rate limit compliance
- Audit logging (planned)

## Scalability

### Current Design (Single Instance)

Suitable for:
- Individual studios
- Small chains
- Development environments
- Single-site operations

Limitations:
- In-memory cache
- Single process
- No horizontal scaling

### Future Enhancements

For multi-site or high-volume:
1. **Redis Cache**: Shared cache across instances
2. **Queue System**: Background job processing
3. **Database**: Persistent storage
4. **Load Balancing**: Multiple MCP instances

## Error Handling

### Error Flow

```
User Request
     ↓
Tool Validation ──❌──→ Validation Error
     ✓
API Call ──❌──→ Retry Logic ──❌──→ API Error
     ✓                    ✓
Cache Store          Recovery
     ↓                    ↓
Format Response ←─────────┘
     ↓
Return to User
```

### Error Categories

1. **User Errors**: Clear messages, no retry
2. **API Errors**: Automatic retry, fallback
3. **System Errors**: Log and alert
4. **Rate Limits**: Cache and backoff

## Monitoring (Planned)

### Metrics to Track

- API call volume
- Cache hit rates
- Error frequencies
- Response times
- Token refresh rate

### Logging Strategy

```typescript
// Structured logging
logger.info('API_CALL', {
  tool: 'getTeacherSchedule',
  teacher: 'Alexia Bauer',
  cacheHit: false,
  duration: 234,
  timestamp: new Date()
});
```

## Testing Strategy

### Unit Tests
- Individual function testing
- Mock API responses
- Edge case coverage

### Integration Tests
- Full tool execution
- Real API calls (sandbox)
- Error scenarios

### Performance Tests
- Load testing
- Memory profiling
- Response time benchmarks

## Deployment

### Development
```bash
bun run dev
```

### Production
```bash
bun run src/index.ts
# or with PM2
pm2 start src/index.ts --interpreter bun
```

### Docker (Planned)
```dockerfile
FROM oven/bun:1.0
WORKDIR /app
COPY . .
RUN bun install
CMD ["bun", "run", "src/index.ts"]
```
