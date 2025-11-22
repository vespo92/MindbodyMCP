'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStaffById, useTeacherSchedule } from '@/hooks/useMindbody';

// ============================================================================
// STAFF DETAIL PAGE
// ============================================================================

export default function StaffDetailPage() {
  const params = useParams();
  const staffId = Number(params.id);

  const { data: staff, isLoading: loadingStaff } = useStaffById(staffId);
  const { data: schedule, isLoading: loadingSchedule } = useTeacherSchedule(staffId);

  if (loadingStaff) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!staff) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Staff Member Not Found</h1>
          <Link href="/staff" className="text-primary hover:underline">
            &larr; Back to Staff
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/staff"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          &larr; Back to Staff
        </Link>

        {/* Staff Header */}
        <header className="mb-8 flex gap-6 items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {staff.imageUrl ? (
              <img
                src={staff.imageUrl}
                alt={staff.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-muted-foreground">
                {staff.firstName?.[0]}
                {staff.lastName?.[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{staff.name}</h1>
            {staff.email && (
              <a
                href={`mailto:${staff.email}`}
                className="text-primary hover:underline"
              >
                {staff.email}
              </a>
            )}
            {staff.mobilePhone && (
              <p className="text-muted-foreground">{staff.mobilePhone}</p>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {staff.bio && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Bio</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{staff.bio}</p>
              </section>
            )}

            {/* Schedule */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Schedule</h2>
              {loadingSchedule ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded" />
                  ))}
                </div>
              ) : schedule?.classes && schedule.classes.length > 0 ? (
                <div className="space-y-4">
                  {schedule.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className={`p-4 border rounded-lg ${
                        cls.isCanceled ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{cls.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cls.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(cls.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(cls.startTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {cls.isSubstitute && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            Substitute
                          </span>
                        )}
                        {cls.isCanceled && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                            Canceled
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {cls.spotsAvailable}/{cls.totalSpots} spots available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming classes scheduled</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule Summary */}
            {schedule?.summary && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">This Week</h2>
                <p className="text-3xl font-bold mb-4">{schedule.totalClasses} Classes</p>

                {/* By Day */}
                {Object.keys(schedule.summary.byDay).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      By Day
                    </h3>
                    <dl className="space-y-1 text-sm">
                      {Object.entries(schedule.summary.byDay).map(([day, count]) => (
                        <div key={day} className="flex justify-between">
                          <dt>{day}</dt>
                          <dd className="font-medium">{count as number}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* By Location */}
                {Object.keys(schedule.summary.byLocation).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      By Location
                    </h3>
                    <dl className="space-y-1 text-sm">
                      {Object.entries(schedule.summary.byLocation).map(([loc, count]) => (
                        <div key={loc} className="flex justify-between">
                          <dt className="truncate">{loc}</dt>
                          <dd className="font-medium">{count as number}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {/* By Class Type */}
                {Object.keys(schedule.summary.byClassType).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      By Class Type
                    </h3>
                    <dl className="space-y-1 text-sm">
                      {Object.entries(schedule.summary.byClassType).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <dt className="truncate">{type}</dt>
                          <dd className="font-medium">{count as number}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
