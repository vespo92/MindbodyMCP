'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClasses, useClassDescriptions, useLocations } from '@/hooks/useMindbody';

// ============================================================================
// CLASSES PAGE - Class Schedule Management
// ============================================================================

export default function ClassesPage() {
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>();
  const [selectedDescription, setSelectedDescription] = useState<number | undefined>();

  const { data: locations } = useLocations();
  const { data: descriptions } = useClassDescriptions();
  const { data: classes, isLoading } = useClasses({
    locationIds: selectedLocation ? [selectedLocation] : undefined,
    classDescriptionIds: selectedDescription ? [selectedDescription] : undefined,
  });

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
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            View and manage class schedules, bookings, and waitlists
          </p>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedLocation ?? ''}
            onChange={(e) =>
              setSelectedLocation(e.target.value ? Number(e.target.value) : undefined)
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Locations</option>
            {locations?.items.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDescription ?? ''}
            onChange={(e) =>
              setSelectedDescription(e.target.value ? Number(e.target.value) : undefined)
            }
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Class Types</option>
            {descriptions?.items.map((desc) => (
              <option key={desc.id} value={desc.id}>
                {desc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : classes?.items && classes.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.items.map((cls) => (
              <ClassCard key={cls.id} classData={cls} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No classes found for the selected filters
          </div>
        )}

        {/* Total Count */}
        {classes?.total && (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing {classes.items.length} of {classes.total} classes
          </p>
        )}
      </div>
    </main>
  );
}

function ClassCard({ classData }: { classData: any }) {
  const startTime = new Date(classData.startDateTime);
  const endTime = new Date(classData.endDateTime);
  const spotsAvailable = classData.maxCapacity - classData.totalBooked;
  const isFull = spotsAvailable <= 0;

  return (
    <div
      className={`bg-card border rounded-lg p-6 ${
        classData.isCanceled ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">{classData.classDescription.name}</h3>
        {classData.isCanceled && (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
            Canceled
          </span>
        )}
        {classData.isSubstitute && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
            Substitute
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium">Instructor:</span> {classData.staff.name}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Location:</span> {classData.location.name}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Date:</span>{' '}
          {startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Time:</span>{' '}
          {startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}{' '}
          -{' '}
          {endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <span
            className={`text-sm font-medium ${
              isFull ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {isFull ? 'Full' : `${spotsAvailable} spots left`}
          </span>
          <span className="text-muted-foreground text-sm">
            {' '}
            / {classData.maxCapacity}
          </span>
        </div>
        {classData.isWaitlistAvailable && classData.totalBookedWaitlist > 0 && (
          <span className="text-sm text-muted-foreground">
            {classData.totalBookedWaitlist} on waitlist
          </span>
        )}
      </div>

      <button
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
          classData.isCanceled || !classData.isAvailable
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : isFull
            ? 'bg-secondary text-secondary-foreground hover:opacity-90'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}
        disabled={classData.isCanceled || !classData.isAvailable}
      >
        {classData.isCanceled
          ? 'Canceled'
          : !classData.isAvailable
          ? 'Unavailable'
          : isFull
          ? 'Join Waitlist'
          : 'Book Class'}
      </button>
    </div>
  );
}
