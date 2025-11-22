'use client';

import Link from 'next/link';
import { useStaff } from '@/hooks/useMindbody';

// ============================================================================
// STAFF PAGE - Staff Management
// ============================================================================

export default function StaffPage() {
  const { data: staff, isLoading } = useStaff();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">
            View staff members and their teaching schedules
          </p>
        </header>

        {/* Staff Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-5 bg-muted rounded mx-auto w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded mx-auto w-1/2" />
              </div>
            ))}
          </div>
        ) : staff?.items && staff.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staff.items.map((member) => (
              <StaffCard key={member.id} staff={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No staff members found
          </div>
        )}

        {/* Total Count */}
        {staff?.total && (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing {staff.items.length} of {staff.total} staff members
          </p>
        )}
      </div>
    </main>
  );
}

function StaffCard({ staff }: { staff: any }) {
  return (
    <Link
      href={`/staff/${staff.id}`}
      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
    >
      {/* Avatar */}
      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
        {staff.imageUrl ? (
          <img
            src={staff.imageUrl}
            alt={staff.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
            {staff.firstName?.[0]}
            {staff.lastName?.[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-lg mb-1">{staff.name}</h3>
      {staff.email && (
        <p className="text-sm text-muted-foreground truncate">{staff.email}</p>
      )}

      {/* Bio preview */}
      {staff.bio && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{staff.bio}</p>
      )}
    </Link>
  );
}
