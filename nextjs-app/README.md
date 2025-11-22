# Mindbody Next.js Integration

A complete Next.js 14+ application that integrates with the Mindbody API, providing a unified, strongly-typed service layer with Prisma ORM for local data caching and tRPC for type-safe API access.

## Features

- **Unified MindbodyService**: Single service class with 50+ methods covering all Mindbody API operations
- **Strongly Typed**: Full TypeScript support with comprehensive type definitions
- **Prisma ORM**: Local database with proper foreign key relationships for caching and offline access
- **tRPC Integration**: End-to-end type safety from database to frontend
- **React Query Hooks**: Pre-built hooks for all data fetching operations
- **Data Sync**: Background synchronization between Mindbody API and local database
- **Example Pages**: Ready-to-use UI components for common operations

## Project Structure

```
nextjs-app/
├── prisma/
│   └── schema.prisma         # Database schema with all Mindbody entities
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── trpc/        # tRPC API handler
│   │   │   └── sync/        # Sync API endpoint
│   │   ├── clients/         # Client management pages
│   │   ├── classes/         # Class schedule pages
│   │   ├── staff/           # Staff management pages
│   │   └── page.tsx         # Dashboard
│   ├── hooks/
│   │   └── useMindbody.ts   # React hooks for all operations
│   ├── lib/
│   │   ├── mindbody/
│   │   │   ├── client.ts    # HTTP client with auth
│   │   │   ├── service.ts   # Unified service class
│   │   │   ├── types.ts     # Type definitions
│   │   │   └── index.ts     # Public API
│   │   ├── sync/
│   │   │   └── index.ts     # Data synchronization service
│   │   ├── trpc/
│   │   │   ├── client.ts    # tRPC client
│   │   │   └── provider.tsx # React provider
│   │   └── db.ts            # Prisma client singleton
│   └── server/
│       ├── trpc.ts          # tRPC initialization
│       └── routers/         # tRPC routers by domain
│           ├── _app.ts      # Root router
│           ├── site.ts
│           ├── staff.ts
│           ├── client.ts
│           ├── class.ts
│           ├── appointment.ts
│           ├── enrollment.ts
│           └── sales.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Mindbody API credentials

### Installation

1. **Install dependencies**:
```bash
cd nextjs-app
npm install
# or
bun install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Initialize the database**:
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

### Using the MindbodyService directly

```typescript
import { getMindbodyService } from '@/lib/mindbody';

const mindbody = getMindbodyService();

// Get all clients
const { items: clients, total } = await mindbody.getClients({
  searchText: 'john',
});

// Add a client to a class
const result = await mindbody.addClientToClass({
  clientId: '123',
  classId: 456,
});

// Get teacher schedule
const schedule = await mindbody.getTeacherSchedule(staffId, startDate, endDate);
```

### Using React Hooks

```typescript
import { useClients, useAddClientToClass } from '@/hooks/useMindbody';

function ClientList() {
  const { data, isLoading } = useClients({ searchText: 'john' });
  const addToClass = useAddClientToClass();

  const handleBookClass = (clientId: string, classId: number) => {
    addToClass.mutate({ clientId, classId });
  };

  // ...
}
```

### Using tRPC directly

```typescript
import { trpc } from '@/lib/trpc/client';

function StaffSchedule({ staffId }: { staffId: number }) {
  const { data: schedule } = trpc.staff.getSchedule.useQuery({
    teacherId: staffId,
  });

  // ...
}
```

### Data Synchronization

```typescript
// Sync all entities
const response = await fetch('/api/sync', { method: 'POST' });
const results = await response.json();

// Sync specific entities
const response = await fetch('/api/sync', {
  method: 'POST',
  body: JSON.stringify({
    entities: ['clients', 'classes', 'staff'],
  }),
});

// Check sync status
const status = await fetch('/api/sync').then(r => r.json());
```

## API Reference

### MindbodyService Methods

#### Site & Locations
- `getSites()` - Get all sites
- `getLocations()` - Get all locations
- `getResources()` - Get all resources
- `getActivationCode()` - Get activation code
- `getPrograms(params?)` - Get programs
- `getSessionTypes(params?)` - Get session types

#### Staff
- `getStaff(params?)` - Get staff members
- `getStaffById(staffId)` - Get single staff member
- `getTeacherSchedule(teacherId, startDate?, endDate?)` - Get teacher's schedule

#### Clients
- `getClients(params?)` - Search/list clients
- `getClientById(clientId)` - Get single client
- `addClient(params)` - Add new client
- `updateClient(params)` - Update client
- `getClientVisits(params)` - Get visit history
- `getClientMemberships(clientId, locationId?)` - Get memberships
- `getClientContracts(clientId)` - Get contracts
- `getClientAccountBalances(clientId)` - Get balances
- `addClientArrival(clientId, locationId)` - Check in client

#### Classes
- `getClasses(params?)` - Get classes
- `getClassById(classId)` - Get single class
- `getClassDescriptions()` - Get class types
- `getClassSchedules(params?)` - Get schedules
- `addClientToClass(params)` - Book class
- `removeClientFromClass(params)` - Cancel booking
- `getWaitlistEntries(classIds?, clientIds?, hidePastEntries?)` - Get waitlist
- `substituteClassTeacher(params)` - Substitute teacher

#### Appointments
- `getAppointments(params)` - Get appointments
- `addAppointment(params)` - Book appointment
- `updateAppointment(params)` - Update appointment
- `getBookableItems(params)` - Get available slots
- `getScheduleItems(params?)` - Get schedule items
- `getActiveSessionTimes(params?)` - Get active times

#### Enrollments
- `getEnrollments(params?)` - Get enrollments
- `addClientToEnrollment(params)` - Enroll client
- `getClientEnrollments(clientId)` - Get client's enrollments

#### Sales
- `getServices(params?)` - Get services
- `getPackages(locationId?, classScheduleId?)` - Get packages
- `getProducts(params?)` - Get products
- `getContracts(params?)` - Get contracts
- `checkoutShoppingCart(params)` - Process checkout
- `purchaseContract(params)` - Purchase contract

## Database Schema

The Prisma schema includes all Mindbody entities with proper relationships:

- **Site** → Locations, Staff, Clients, Programs, etc.
- **Location** → Classes, Appointments, Enrollments
- **Staff** → Classes, Appointments, ClassSchedules
- **Client** → ClassBookings, Appointments, Memberships, Contracts, Visits
- **Class** → ClassSchedule, ClassDescription, Location, Staff, Bookings
- **Appointment** → Client, Staff, Location, SessionType, Resources

See `prisma/schema.prisma` for the complete schema.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MINDBODY_API_KEY` | Mindbody API key | Yes |
| `MINDBODY_SITE_ID` | Site ID (-99 for sandbox) | Yes |
| `MINDBODY_SOURCE_NAME` | Source name | Yes |
| `MINDBODY_SOURCE_PASSWORD` | Source password | Yes |
| `MINDBODY_API_URL` | API URL (default: v6 API) | No |
| `NEXT_PUBLIC_APP_URL` | Public app URL | No |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run typecheck    # Run TypeScript check
```

## License

MIT
