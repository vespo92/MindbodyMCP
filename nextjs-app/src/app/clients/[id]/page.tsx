'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useClientById,
  useClientVisits,
  useClientMemberships,
  useClientContracts,
  useClientAccountBalances,
} from '@/hooks/useMindbody';

// ============================================================================
// CLIENT DETAIL PAGE
// ============================================================================

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading: loadingClient } = useClientById(clientId);
  const { data: visits } = useClientVisits(clientId);
  const { data: memberships } = useClientMemberships(clientId);
  const { data: contracts } = useClientContracts(clientId);
  const { data: balances } = useClientAccountBalances(clientId);

  if (loadingClient) {
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

  if (!client) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <Link href="/clients" className="text-primary hover:underline">
            &larr; Back to Clients
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/clients"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          &larr; Back to Clients
        </Link>

        {/* Client Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">
            {client.firstName} {client.lastName}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span
              className={`px-2 py-1 rounded text-xs ${
                client.isProspect
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {client.isProspect ? 'Prospect' : 'Active'}
            </span>
            {client.email && (
              <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                {client.email}
              </a>
            )}
            {client.phone && <span>{client.phone}</span>}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{client.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{client.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>
                    {client.addressLine1 ? (
                      <>
                        {client.addressLine1}
                        {client.city && `, ${client.city}`}
                        {client.state && `, ${client.state}`}
                        {client.postalCode && ` ${client.postalCode}`}
                      </>
                    ) : (
                      '-'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Birth Date</dt>
                  <dd>
                    {client.birthDate
                      ? new Date(client.birthDate).toLocaleDateString()
                      : '-'}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Emergency Contact */}
            {client.emergencyContact && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd>{client.emergencyContact.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{client.emergencyContact.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Relationship</dt>
                    <dd>{client.emergencyContact.relationship}</dd>
                  </div>
                </dl>
              </section>
            )}

            {/* Recent Visits */}
            {visits && visits.visits.length > 0 && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
                <div className="space-y-3">
                  {visits.visits.slice(0, 5).map((visit) => (
                    <div
                      key={visit.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{visit.className}</p>
                        <p className="text-sm text-muted-foreground">
                          {visit.instructor} at {visit.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(visit.startTime).toLocaleDateString()}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            visit.signedIn
                              ? 'bg-green-100 text-green-800'
                              : visit.lateCancel
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {visit.signedIn
                            ? 'Attended'
                            : visit.lateCancel
                            ? 'Late Cancel'
                            : 'No Show'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {visits.total > 5 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Showing 5 of {visits.total} visits
                  </p>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Balance */}
            <section className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Account Balance</h2>
              <p className="text-3xl font-bold">
                ${balances?.accountBalance?.toFixed(2) || '0.00'}
              </p>
            </section>

            {/* Memberships */}
            {memberships && memberships.items.length > 0 && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Memberships</h2>
                <div className="space-y-3">
                  {memberships.items.map((membership) => (
                    <div key={membership.id} className="py-2 border-b last:border-0">
                      <p className="font-medium">{membership.name}</p>
                      {membership.remainingClasses !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {membership.remainingClasses} classes remaining
                        </p>
                      )}
                      {membership.expirationDate && (
                        <p className="text-sm text-muted-foreground">
                          Expires:{' '}
                          {new Date(membership.expirationDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contracts */}
            {contracts && contracts.items.length > 0 && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Contracts</h2>
                <div className="space-y-3">
                  {contracts.items.map((contract) => (
                    <div key={contract.id} className="py-2 border-b last:border-0">
                      <p className="font-medium">{contract.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {contract.contractType}
                      </p>
                      {contract.endDate && (
                        <p className="text-sm text-muted-foreground">
                          Ends: {new Date(contract.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Visit Summary */}
            {visits?.summary && (
              <section className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Visit Summary</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Attended</dt>
                    <dd className="font-medium">{visits.summary.totalAttended}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">No Shows</dt>
                    <dd className="font-medium">{visits.summary.totalNoShows}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Late Cancels</dt>
                    <dd className="font-medium">{visits.summary.totalLateCancels}</dd>
                  </div>
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
