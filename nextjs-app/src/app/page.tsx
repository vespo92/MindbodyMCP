'use client';

import Link from 'next/link';
import { useSites, useLocations, useStaff, useClasses } from '@/hooks/useMindbody';

// ============================================================================
// HOME PAGE - Dashboard Overview
// ============================================================================

export default function HomePage() {
  const { data: sites, isLoading: loadingSites } = useSites();
  const { data: locations, isLoading: loadingLocations } = useLocations();
  const { data: staff, isLoading: loadingStaff } = useStaff();
  const { data: classes, isLoading: loadingClasses } = useClasses();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Mindbody Studio Manager</h1>
          <p className="text-muted-foreground">
            Complete fitness and wellness studio management powered by Mindbody API
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Sites"
            value={sites?.items.length ?? 0}
            loading={loadingSites}
            href="/sites"
          />
          <StatCard
            title="Locations"
            value={locations?.items.length ?? 0}
            loading={loadingLocations}
            href="/locations"
          />
          <StatCard
            title="Staff Members"
            value={staff?.items.length ?? 0}
            loading={loadingStaff}
            href="/staff"
          />
          <StatCard
            title="Upcoming Classes"
            value={classes?.items.length ?? 0}
            loading={loadingClasses}
            href="/classes"
          />
        </div>

        {/* Quick Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavCard
              title="Clients"
              description="Manage client profiles, memberships, and visit history"
              href="/clients"
            />
            <NavCard
              title="Classes"
              description="View and manage class schedules, bookings, and waitlists"
              href="/classes"
            />
            <NavCard
              title="Staff"
              description="View staff members and their teaching schedules"
              href="/staff"
            />
            <NavCard
              title="Appointments"
              description="Manage appointments and bookable items"
              href="/appointments"
            />
            <NavCard
              title="Enrollments"
              description="Courses, workshops, and enrollment management"
              href="/enrollments"
            />
            <NavCard
              title="Sales"
              description="Services, packages, products, and contracts"
              href="/sales"
            />
          </div>
        </section>

        {/* Recent Activity */}
        {classes?.items && classes.items.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Upcoming Classes</h2>
            <div className="bg-card border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium">Class</th>
                    <th className="text-left p-4 font-medium">Instructor</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-left p-4 font-medium">Date & Time</th>
                    <th className="text-left p-4 font-medium">Spots</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.items.slice(0, 5).map((cls) => (
                    <tr key={cls.id} className="border-t">
                      <td className="p-4">{cls.classDescription.name}</td>
                      <td className="p-4">{cls.staff.name}</td>
                      <td className="p-4">{cls.location.name}</td>
                      <td className="p-4">
                        {new Date(cls.startDateTime).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {cls.maxCapacity - cls.totalBooked} / {cls.maxCapacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  loading,
  href,
}: {
  title: string;
  value: number;
  loading: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      {loading ? (
        <div className="h-8 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold">{value}</p>
      )}
    </Link>
  );
}

function NavCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow group"
    >
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
