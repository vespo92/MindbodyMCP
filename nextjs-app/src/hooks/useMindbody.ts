'use client';

import { trpc } from '@/lib/trpc/client';

// ============================================================================
// MINDBODY REACT HOOKS - Type-safe data fetching with React Query
// ============================================================================

// ==========================================================================
// SITE & LOCATION HOOKS
// ==========================================================================

export function useSites() {
  return trpc.site.getSites.useQuery();
}

export function useLocations() {
  return trpc.site.getLocations.useQuery();
}

export function useResources() {
  return trpc.site.getResources.useQuery();
}

export function usePrograms(params?: { scheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment'; onlineOnly?: boolean }) {
  return trpc.site.getPrograms.useQuery(params);
}

export function useSessionTypes(params?: { programIds?: number[]; onlineOnly?: boolean }) {
  return trpc.site.getSessionTypes.useQuery(params);
}

// ==========================================================================
// STAFF HOOKS
// ==========================================================================

export function useStaff(params?: { staffIds?: number[]; locationIds?: number[] }) {
  return trpc.staff.getAll.useQuery(params);
}

export function useStaffById(staffId: number) {
  return trpc.staff.getById.useQuery({ staffId }, { enabled: !!staffId });
}

export function useTeacherSchedule(teacherId: number, startDate?: string, endDate?: string) {
  return trpc.staff.getSchedule.useQuery(
    { teacherId, startDate, endDate },
    { enabled: !!teacherId }
  );
}

// ==========================================================================
// CLIENT HOOKS
// ==========================================================================

export function useClients(params?: { searchText?: string; clientIds?: string[]; isProspect?: boolean }) {
  return trpc.client.getAll.useQuery(params);
}

export function useClientById(clientId: string) {
  return trpc.client.getById.useQuery({ clientId }, { enabled: !!clientId });
}

export function useClientSearch(searchText: string) {
  return trpc.client.search.useQuery({ searchText }, { enabled: searchText.length >= 2 });
}

export function useClientVisits(clientId: string, startDate?: string, endDate?: string) {
  return trpc.client.getVisits.useQuery(
    { clientId, startDate, endDate },
    { enabled: !!clientId }
  );
}

export function useClientMemberships(clientId: string, locationId?: number) {
  return trpc.client.getMemberships.useQuery(
    { clientId, locationId },
    { enabled: !!clientId }
  );
}

export function useClientContracts(clientId: string) {
  return trpc.client.getContracts.useQuery({ clientId }, { enabled: !!clientId });
}

export function useClientAccountBalances(clientId: string) {
  return trpc.client.getAccountBalances.useQuery({ clientId }, { enabled: !!clientId });
}

export function useAddClient() {
  const utils = trpc.useUtils();
  return trpc.client.add.useMutation({
    onSuccess: () => {
      utils.client.getAll.invalidate();
    },
  });
}

export function useUpdateClient() {
  const utils = trpc.useUtils();
  return trpc.client.update.useMutation({
    onSuccess: () => {
      utils.client.getAll.invalidate();
    },
  });
}

export function useClientCheckIn() {
  return trpc.client.checkIn.useMutation();
}

// ==========================================================================
// CLASS HOOKS
// ==========================================================================

export function useClasses(params?: {
  classDescriptionIds?: number[];
  staffIds?: number[];
  locationIds?: number[];
  startDateTime?: string;
  endDateTime?: string;
}) {
  return trpc.class.getAll.useQuery(params);
}

export function useClassById(classId: number) {
  return trpc.class.getById.useQuery({ classId }, { enabled: !!classId });
}

export function useClassDescriptions() {
  return trpc.class.getDescriptions.useQuery();
}

export function useClassSchedules(params?: {
  locationIds?: number[];
  classDescriptionIds?: number[];
  staffIds?: number[];
  startDate?: string;
  endDate?: string;
}) {
  return trpc.class.getSchedules.useQuery(params);
}

export function useClassWaitlist(classIds?: number[]) {
  return trpc.class.getWaitlist.useQuery({ classIds });
}

export function useAddClientToClass() {
  const utils = trpc.useUtils();
  return trpc.class.addClient.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
    },
  });
}

export function useRemoveClientFromClass() {
  const utils = trpc.useUtils();
  return trpc.class.removeClient.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
    },
  });
}

export function useSubstituteTeacher() {
  const utils = trpc.useUtils();
  return trpc.class.substituteTeacher.useMutation({
    onSuccess: () => {
      utils.class.getAll.invalidate();
    },
  });
}

// ==========================================================================
// APPOINTMENT HOOKS
// ==========================================================================

export function useAppointments(params: {
  staffIds: number[];
  locationIds?: number[];
  startDate?: string;
  endDate?: string;
}) {
  return trpc.appointment.getAll.useQuery(params, {
    enabled: params.staffIds.length > 0,
  });
}

export function useBookableItems(params: {
  sessionTypeIds: number[];
  locationIds?: number[];
  staffIds?: number[];
  startDate?: string;
  endDate?: string;
}) {
  return trpc.appointment.getBookableItems.useQuery(params, {
    enabled: params.sessionTypeIds.length > 0,
  });
}

export function useScheduleItems(params?: {
  locationIds?: number[];
  staffIds?: number[];
  startDate?: string;
  endDate?: string;
}) {
  return trpc.appointment.getScheduleItems.useQuery(params);
}

export function useActiveSessionTimes(params?: {
  scheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment';
  sessionTypeIds?: number[];
}) {
  return trpc.appointment.getActiveSessionTimes.useQuery(params);
}

export function useAddAppointment() {
  const utils = trpc.useUtils();
  return trpc.appointment.add.useMutation({
    onSuccess: () => {
      utils.appointment.getAll.invalidate();
    },
  });
}

export function useUpdateAppointment() {
  const utils = trpc.useUtils();
  return trpc.appointment.update.useMutation({
    onSuccess: () => {
      utils.appointment.getAll.invalidate();
    },
  });
}

// ==========================================================================
// ENROLLMENT HOOKS
// ==========================================================================

export function useEnrollments(params?: {
  locationIds?: number[];
  staffIds?: number[];
  programIds?: number[];
  startDate?: string;
  endDate?: string;
}) {
  return trpc.enrollment.getAll.useQuery(params);
}

export function useClientEnrollments(clientId: string) {
  return trpc.enrollment.getClientEnrollments.useQuery(
    { clientId },
    { enabled: !!clientId }
  );
}

export function useAddClientToEnrollment() {
  const utils = trpc.useUtils();
  return trpc.enrollment.addClient.useMutation({
    onSuccess: () => {
      utils.enrollment.getAll.invalidate();
    },
  });
}

// ==========================================================================
// SALES HOOKS
// ==========================================================================

export function useServices(params?: {
  programIds?: number[];
  sessionTypeIds?: number[];
  locationId?: number;
}) {
  return trpc.sales.getServices.useQuery(params);
}

export function usePackages(params?: { locationId?: number; classScheduleId?: number }) {
  return trpc.sales.getPackages.useQuery(params);
}

export function useProducts(params?: {
  searchText?: string;
  categoryIds?: string[];
  sellOnline?: boolean;
}) {
  return trpc.sales.getProducts.useQuery(params);
}

export function useContracts(params?: {
  contractIds?: number[];
  soldOnline?: boolean;
  locationId?: number;
}) {
  return trpc.sales.getContracts.useQuery(params);
}

export function useCheckout() {
  return trpc.sales.checkout.useMutation();
}

export function usePurchaseContract() {
  return trpc.sales.purchaseContract.useMutation();
}
