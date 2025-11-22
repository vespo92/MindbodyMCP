'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClients, useClientSearch } from '@/hooks/useMindbody';

// ============================================================================
// CLIENTS PAGE - Client Management
// ============================================================================

export default function ClientsPage() {
  const [searchText, setSearchText] = useState('');
  const { data: searchResults, isLoading: searching } = useClientSearch(searchText);
  const { data: allClients, isLoading: loadingAll } = useClients();

  const clients = searchText.length >= 2 ? searchResults : allClients;
  const isLoading = searchText.length >= 2 ? searching : loadingAll;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground">
              Manage client profiles, memberships, and visit history
            </p>
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
            Add Client
          </button>
        </header>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Clients Table */}
        <div className="bg-card border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">Loading clients...</div>
            </div>
          ) : clients?.items && clients.items.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Balance</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.items.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-muted/50">
                    <td className="p-4 font-medium">
                      {client.firstName} {client.lastName}
                    </td>
                    <td className="p-4">{client.email || '-'}</td>
                    <td className="p-4">{client.phone || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          client.isProspect
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {client.isProspect ? 'Prospect' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      ${client.accountBalance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchText.length >= 2 ? 'No clients found' : 'No clients available'}
            </div>
          )}
        </div>

        {/* Total Count */}
        {clients?.total && (
          <p className="mt-4 text-sm text-muted-foreground">
            Showing {clients.items.length} of {clients.total} clients
          </p>
        )}
      </div>
    </main>
  );
}
