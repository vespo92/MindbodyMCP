# Claude.md - Mindbody MCP Server v2.0

## Overview
This is the Mindbody MCP Server - a comprehensive Model Context Protocol server that provides AI assistants with complete access to the Mindbody API for fitness/wellness studio management. Perfect for yoga studios, pilates studios, gyms, and wellness centers.

## Core Capabilities
- **Complete Class Management**: View, book, cancel, substitute teachers, manage waitlists
- **Client Management**: Add/update clients, track visits, memberships, balances
- **Sales & Commerce**: Process payments, sell packages, memberships, products
- **Staff Management**: View schedules, manage appointments, track availability
- **Site Operations**: Manage locations, programs, resources, session types
- **Appointments**: Book, update, find available slots
- **Enrollments**: Manage courses, workshops, series registrations

## Available Tools (50+ endpoints)

### 📅 Class Management

#### `getClasses`
Get all classes with comprehensive filtering options.

**Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `locationIds` (optional): Array of location IDs
- `classDescriptionIds` (optional): Array of class type IDs
- `staffIds` (optional): Array of instructor IDs

**Returns:** List of classes with availability, instructor, location, and booking status

#### `getClassDescriptions`
Get all class types offered (Vinyasa, Hatha, Hot Yoga, etc.).

**Returns:** Complete list of class types with descriptions and prerequisites

#### `getClassSchedules`
Get recurring class schedules/templates.

**Parameters:**
- `locationIds` (optional): Filter by locations
- `classDescriptionIds` (optional): Filter by class types
- `staffIds` (optional): Filter by instructors
- `programIds` (optional): Filter by programs

#### `addClientToClass`
Book a client into a class.

**Parameters:**
- `clientId` (required): Client ID
- `classId` (required): Class ID to book
- `requirePayment` (optional): Require payment (default true)
- `waitlist` (optional): Add to waitlist if full

#### `removeClientFromClass`
Cancel a client's class booking.

**Parameters:**
- `clientId` (required): Client ID
- `classId` (required): Class ID
- `lateCancel` (optional): Mark as late cancellation

#### `getWaitlistEntries`
View waitlist entries for classes.

**Parameters:**
- `classScheduleIds` (optional): Class schedule IDs
- `classIds` (optional): Specific class IDs
- `clientIds` (optional): Filter by clients

#### `substituteClassTeacher`
Substitute an instructor for a class.

**Parameters:**
- `classId` (required): Class ID
- `originalTeacherId` (required): Original instructor ID
- `substituteTeacherId` (required): Substitute instructor ID

### 👥 Client Management

#### `getClients`
Search and retrieve client information.

**Parameters:**
- `searchText` (optional): Search by name/email/phone
- `clientIds` (optional): Specific client IDs
- `lastModifiedDate` (optional): Recently modified clients
- `isProspect` (optional): Filter prospects

**Returns:** Client details including contact info, emergency contacts, membership status

#### `addClient`
Register a new client.

**Parameters:**
- `firstName` (required): First name
- `lastName` (required): Last name
- `email` (optional): Email address
- `mobilePhone` (optional): Mobile phone
- `birthDate` (optional): Birth date
- Plus address, emergency contact, and preference fields

#### `updateClient`
Update existing client information.

**Parameters:**
- `clientId` (required): Client ID
- `updates` (required): Object with fields to update

#### `getClientVisits`
Get client's attendance history.

**Parameters:**
- `clientId` (required): Client ID
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Returns:** Visit history with attendance stats, no-shows, late cancels

#### `getClientMemberships`
View client's active memberships.

**Parameters:**
- `clientId` (required): Client ID
- `locationId` (optional): Filter by location

#### `addClientArrival`
Check in a client at the studio.

**Parameters:**
- `clientId` (required): Client ID
- `locationId` (required): Location ID

#### `getClientAccountBalances`
Get client's account and credit balances.

**Parameters:**
- `clientId` (required): Client ID

#### `getClientContracts`
View client's contracts and auto-renewing memberships.

**Parameters:**
- `clientId` (required): Client ID

### 💰 Sales & Commerce

#### `getServices`
Get available services (class packages, memberships).

**Parameters:**
- `programIds` (optional): Filter by programs
- `sessionTypeIds` (optional): Filter by session types
- `locationId` (optional): Filter by location
- `classId` (optional): Services for specific class

#### `getPackages`
Get class package options.

**Parameters:**
- `locationId` (optional): Filter by location
- `classScheduleId` (optional): Packages for specific class

#### `getProducts`
Get retail products (mats, blocks, apparel).

**Parameters:**
- `productIds` (optional): Specific products
- `searchText` (optional): Search products
- `categoryIds` (optional): Filter by category
- `sellOnline` (optional): Online products only

#### `getContracts`
Get membership contract types.

**Parameters:**
- `contractIds` (optional): Specific contracts
- `soldOnline` (optional): Online contracts only
- `locationId` (optional): Filter by location

#### `checkoutShoppingCart`
Process a complete purchase transaction.

**Parameters:**
- `clientId` (required): Client ID
- `items` (required): Array of items to purchase
- `payments` (required): Payment methods
- `promotionCode` (optional): Discount code
- `sendEmail` (optional): Send receipt

#### `purchaseContract`
Purchase a membership/contract.

**Parameters:**
- `clientId` (required): Client ID
- `contractId` (required): Contract type ID
- `startDate` (required): Start date
- `firstPaymentOccurs` (optional): Payment timing
- `promotionCode` (optional): Discount code

### 🏢 Site & Location Management

#### `getSites`
Get business/site information.

**Returns:** Site details, payment settings, branding, timezone

#### `getLocations`
Get all studio locations.

**Returns:** Locations with addresses, hours, amenities, coordinates

#### `getPrograms`
Get programs offered (Yoga, Pilates, Barre, etc.).

**Parameters:**
- `scheduleType` (optional): Filter by type (Class/Enrollment/Appointment)
- `onlineOnly` (optional): Online programs only

#### `getResources`
Get resources (rooms, equipment).

**Parameters:**
- `sessionTypeIds` (optional): Filter by session type
- `locationId` (optional): Filter by location
- `startDateTime` (optional): Available from
- `endDateTime` (optional): Available until

#### `getSessionTypes`
Get session types (class formats, appointment types).

**Parameters:**
- `programIds` (optional): Filter by programs
- `onlineOnly` (optional): Online sessions only

#### `getStaff`
Get all staff members.

**Parameters:**
- `staffIds` (optional): Specific staff IDs
- `filters` (optional): Apply filters
- `sessionTypeIds` (optional): Staff for session types
- `locationIds` (optional): Staff at locations

#### `getTeacherSchedule`
Get a teacher's complete schedule.

**Parameters:**
- `teacherName` (required): Teacher's name
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Returns:** Detailed schedule with classes, locations, and availability

### 📆 Appointments

#### `getStaffAppointments`
View staff appointment schedules.

**Parameters:**
- `staffIds` (required): Staff member IDs
- `locationIds` (optional): Filter by location
- `startDate` (optional): Start date
- `endDate` (optional): End date

#### `addAppointment`
Book a new appointment.

**Parameters:**
- `clientId` (required): Client ID
- `staffId` (required): Staff member ID
- `locationId` (required): Location ID
- `sessionTypeId` (required): Service type ID
- `startDateTime` (required): Start time (ISO format)
- `notes` (optional): Appointment notes

#### `updateAppointment`
Modify an existing appointment.

**Parameters:**
- `appointmentId` (required): Appointment ID
- `staffId` (optional): Change staff
- `startDateTime` (optional): New time
- `notes` (optional): Update notes

#### `getBookableItems`
Find available appointment slots.

**Parameters:**
- `sessionTypeIds` (required): Service types
- `locationIds` (optional): Locations
- `staffIds` (optional): Specific staff
- `startDate` (optional): Search from
- `endDate` (optional): Search until

#### `getActiveSessionTimes`
Get recurring availability patterns.

**Parameters:**
- `scheduleType` (optional): Type filter
- `sessionTypeIds` (optional): Session types
- `days` (optional): Days of week

#### `getScheduleItems`
Get detailed schedule availability.

**Parameters:**
- `locationIds` (optional): Locations
- `staffIds` (optional): Staff members
- `startDate` (optional): Start date
- `endDate` (optional): End date

### 🎓 Enrollments (Courses/Workshops)

#### `getEnrollments`
Get available enrollments (workshops, courses, series).

**Parameters:**
- `locationIds` (optional): Filter by location
- `staffIds` (optional): Filter by instructor
- `programIds` (optional): Filter by program
- `startDate` (optional): Starting from
- `endDate` (optional): Ending by

**Returns:** Enrollment options with availability and pricing

#### `addClientToEnrollment`
Register client for course/workshop.

**Parameters:**
- `clientId` (required): Client ID
- `classScheduleIds` (required): Course IDs
- `enrollmentDates` (optional): Specific dates
- `waitlist` (optional): Add to waitlist

#### `getClientEnrollments`
View client's enrollments.

**Parameters:**
- `clientId` (required): Client ID

**Returns:** Current and past enrollments with attendance

## Architecture & Performance

### High Performance
- Built on Bun runtime for 4x faster execution
- Intelligent caching system (5-min classes, 60-min static data)
- Automatic retry with exponential backoff
- Rate limit aware (2000 req/hour limit)

### Authentication
- OAuth 2.0 with automatic token refresh
- Secure credential management via environment variables
- Site-specific authentication support

### Error Handling
- User-friendly error messages
- Graceful API failure handling
- Detailed debug logging available

## Common Use Cases

### Daily Operations
```
"Show me today's yoga classes"
"Check in Sarah Johnson" 
"Book John into the 6pm Vinyasa class"
"Who's on the waitlist for tomorrow's Hot Yoga?"
```

### Staff Management
```
"Get Alexia's teaching schedule this week"
"Find a substitute for Maria's Thursday class"
"Show me which instructors teach Pilates"
"What appointments does Dr. Smith have today?"
```

### Client Services
```
"Add new client Jennifer Wilson"
"What's Michael's attendance this month?"
"Show Sarah's active memberships"
"Get client balance for ID 12345"
```

### Sales Operations
```
"What class packages are available?"
"Show me unlimited membership options"
"Process purchase of 10-class package for Amy"
"What products do we sell online?"
```

### Business Analytics
```
"How many spots available in this week's classes?"
"Show class attendance by instructor"
"Get waitlist counts by class type"
"List all studio locations and hours"
```

## Configuration

### Required Environment Variables
```
MINDBODY_API_KEY=your_api_key
MINDBODY_SITE_ID=your_site_id
MINDBODY_SOURCE_NAME=your_source_name
MINDBODY_SOURCE_PASSWORD=your_source_password
```

### Optional Settings
```
MINDBODY_API_URL=https://api.mindbodyonline.com/public/v6
CACHE_TTL_MINUTES=5
MCP_SERVER_NAME=mindbody-mcp
MCP_SERVER_VERSION=2.0.0
```

## Best Practices

### Searching
- Use exact names when known for better performance
- Provide date ranges to limit data returned
- Use IDs instead of names when available

### Booking
- Always check availability before booking
- Handle waitlist scenarios gracefully
- Verify payment requirements

### Caching
- Class data cached for 5 minutes
- Static data (locations, staff) cached for 60 minutes
- Cache clears automatically on write operations

## Troubleshooting

### Common Issues

**"Teacher not found"**
- Check exact spelling
- Try first name only or last name only
- Use getStaff to list all teachers

**"Class is full"**
- Check waitlist availability
- Suggest alternative times
- Show similar classes

**Rate limits**
- Implement request throttling
- Use caching effectively
- Batch operations when possible

**Empty results**
- Verify date ranges
- Check location filters
- Ensure teacher has scheduled classes

## Future Enhancements
- AI-powered substitute recommendations
- Predictive attendance analytics
- Automated waitlist management
- Multi-site synchronization
- Advanced reporting tools
- Webhook integration for real-time updates
- Mobile app integration
- Revenue optimization suggestions

## Support
For issues or questions about the MCP server, please check the repository documentation or contact support.