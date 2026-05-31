import { mindbodyClient, type IMindbodyClient } from '../api/client';
import { classCache, SimpleCache } from '../cache/index';
import {
  GetClassesRequest,
  GetClassesResponse,
  Class,
  ClassDescription,
} from '../types/mindbody';

// Get all classes with filtering options
export async function getClassesTool(
  startDate?: string,
  endDate?: string,
  locationIds?: number[],
  classDescriptionIds?: number[],
  staffIds?: number[],
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  classes: Array<{
    id: number;
    name: string;
    description: string;
    instructor: string;
    startTime: string;
    endTime: string;
    location: string;
    spotsAvailable: number;
    totalSpots: number;
    isWaitlistAvailable: boolean;
    isCanceled: boolean;
    isSubstitute: boolean;
    virtualStreamLink?: string;
  }>;
  summary: {
    totalClasses: number;
    totalAvailableSpots: number;
    byInstructor: Record<string, number>;
    byLocation: Record<string, number>;
    byClassType: Record<string, number>;
  };
}> {
  const cacheKey = `classes:${startDate}:${endDate}:${locationIds?.join(',')}:${classDescriptionIds?.join(',')}:${staffIds?.join(',')}`;
  let cached = cache.get<GetClassesResponse>(cacheKey);

  if (!cached) {
    const request: GetClassesRequest = {
      StartDateTime: startDate ? `${startDate}T00:00:00` : new Date().toISOString(),
      EndDateTime: endDate ? `${endDate}T23:59:59` : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      LocationIds: locationIds,
      ClassDescriptionIds: classDescriptionIds,
      StaffIds: staffIds,
      Limit: 200,
    };

    cached = await client.get<GetClassesResponse>('/class/classes', {
      params: request,
    });

    cache.set(cacheKey, cached);
  }

  // Process and format results
  const formattedClasses = cached.Classes.map((cls) => ({
    id: cls.Id,
    name: cls.ClassDescription?.Name || '',
    description: cls.ClassDescription?.Description || '',
    instructor: cls.Staff?.Name || `${cls.Staff?.FirstName || ''} ${cls.Staff?.LastName || ''}`.trim() || '',
    startTime: cls.StartDateTime,
    endTime: cls.EndDateTime,
    location: cls.Location?.Name || '',
    spotsAvailable: cls.MaxCapacity - cls.TotalBooked,
    totalSpots: cls.MaxCapacity,
    isWaitlistAvailable: cls.IsWaitlistAvailable,
    isCanceled: cls.IsCanceled,
    isSubstitute: cls.IsSubstitute,
    virtualStreamLink: (cls as any).VirtualStreamLink,
  }));

  // Generate summary
  const summary = {
    totalClasses: formattedClasses.filter(c => !c.isCanceled).length,
    totalAvailableSpots: formattedClasses.reduce((sum, c) => sum + (c.isCanceled ? 0 : c.spotsAvailable), 0),
    byInstructor: {} as Record<string, number>,
    byLocation: {} as Record<string, number>,
    byClassType: {} as Record<string, number>,
  };

  formattedClasses.forEach((cls) => {
    if (!cls.isCanceled) {
      summary.byInstructor[cls.instructor] = (summary.byInstructor[cls.instructor] || 0) + 1;
      summary.byLocation[cls.location] = (summary.byLocation[cls.location] || 0) + 1;
      summary.byClassType[cls.name] = (summary.byClassType[cls.name] || 0) + 1;
    }
  });

  return { classes: formattedClasses, summary };
}

// Get class descriptions (types of classes offered)
export async function getClassDescriptionsTool(
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  classTypes: Array<{
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    prerequisites?: string;
    level?: string;
  }>;
  totalTypes: number;
}> {
  const cacheKey = 'class-descriptions';
  let cached = cache.get<any>(cacheKey);

  if (!cached) {
    cached = await client.get<any>('/class/classdescriptions', {
      params: { Limit: 200 },
    });
    cache.set(cacheKey, cached, 60); // Cache for 60 minutes
  }

  const classTypes = cached.ClassDescriptions.map((desc: any) => ({
    id: desc.Id,
    name: desc.Name,
    description: desc.Description || '',
    imageUrl: desc.ImageUrl,
    prerequisites: desc.Prereq,
    level: desc.Level?.Name,
  }));

  return {
    classTypes,
    totalTypes: classTypes.length,
  };
}

// Add client to class (book a class)
export async function addClientToClassTool(
  clientId: string,
  classId: number,
  requirePayment: boolean = true,
  waitlist: boolean = false,
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  success: boolean;
  visitId?: number;
  message: string;
  requiresPayment?: boolean;
  amountDue?: number;
}> {
  try {
    const response = await client.post<any>('/class/addclienttoclass', {
      ClientId: clientId,
      ClassId: classId,
      RequirePayment: requirePayment,
      Waitlist: waitlist,
    });

    // Clear cache after booking
    cache.clear();

    return {
      success: true,
      visitId: response.Visit?.Id,
      message: waitlist ? 'Successfully added to waitlist' : 'Successfully booked class',
      requiresPayment: response.PaymentRequired,
      amountDue: response.ServicePaymentInfo?.Amount,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to book class',
    };
  }
}

// Remove client from class (cancel booking)
export async function removeClientFromClassTool(
  clientId: string,
  classId: number,
  lateCancel: boolean = false,
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await client.post('/class/removeclientfromclass', {
      ClientId: clientId,
      ClassId: classId,
      LateCancel: lateCancel,
    });

    // Clear cache after cancellation
    cache.clear();

    return {
      success: true,
      message: 'Successfully cancelled class booking',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to cancel class',
    };
  }
}

// Get waitlist entries for a class
export async function getWaitlistEntriesTool(
  classScheduleIds?: number[],
  classIds?: number[],
  clientIds?: string[],
  client: IMindbodyClient = mindbodyClient
): Promise<{
  entries: Array<{
    classId: number;
    className: string;
    classDate: string;
    clientId: string;
    clientName: string;
    enrollmentDatetime: string;
    requestDatetime: string;
    position: number;
  }>;
  totalEntries: number;
}> {
  const response = await client.get<any>('/class/waitlistentries', {
    params: {
      ClassScheduleIds: classScheduleIds,
      ClassIds: classIds,
      ClientIds: clientIds,
      Limit: 200,
    },
  });

  const entries = response.WaitlistEntries.map((entry: any) => ({
    classId: entry.ClassId,
    className: entry.ClassName,
    classDate: entry.ClassDate,
    clientId: entry.ClientId,
    clientName: entry.ClientName,
    enrollmentDatetime: entry.EnrollmentDatetime,
    requestDatetime: entry.RequestDatetime,
    position: entry.Position,
  }));

  return {
    entries,
    totalEntries: entries.length,
  };
}

// Substitute class teacher
export async function substituteClassTeacherTool(
  classId: number,
  originalTeacherId: number,
  substituteTeacherId: number,
  substituteTeacherName?: string,
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  success: boolean;
  message: string;
  updatedClass?: {
    id: number;
    name: string;
    originalTeacher: string;
    substituteTeacher: string;
    startTime: string;
  };
}> {
  try {
    const response = await client.post<any>('/class/substituteclassteacher', {
      ClassId: classId,
      StaffId: originalTeacherId,
      SubstituteStaffId: substituteTeacherId,
      SubstituteStaffName: substituteTeacherName,
    });

    // Clear cache after substitution
    cache.clear();

    return {
      success: true,
      message: 'Successfully substituted teacher',
      updatedClass: response.Class ? {
        id: response.Class.Id,
        name: response.Class.ClassDescription?.Name || '',
        originalTeacher: response.Class.Staff?.Name || `${response.Class.Staff?.FirstName || ''} ${response.Class.Staff?.LastName || ''}`.trim() || '',
        substituteTeacher: response.Class.SubstituteTeacher?.Name || substituteTeacherName || 'Unknown',
        startTime: response.Class.StartDateTime,
      } : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to substitute teacher',
    };
  }
}

// Get class schedules
export async function getClassSchedulesTool(
  locationIds?: number[],
  classDescriptionIds?: number[],
  staffIds?: number[],
  programIds?: number[],
  client: IMindbodyClient = mindbodyClient
): Promise<{
  schedules: Array<{
    id: number;
    className: string;
    instructor: string;
    location: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }>;
  totalSchedules: number;
}> {
  const response = await client.get<any>('/class/classschedules', {
    params: {
      LocationIds: locationIds,
      ClassDescriptionIds: classDescriptionIds,
      StaffIds: staffIds,
      ProgramIds: programIds,
      Limit: 200,
    },
  });

  const schedules = response.ClassSchedules.map((schedule: any) => ({
    id: schedule.Id,
    className: schedule.ClassDescription?.Name || '',
    instructor: schedule.Staff?.Name || `${schedule.Staff?.FirstName || ''} ${schedule.Staff?.LastName || ''}`.trim() || '',
    location: schedule.Location?.Name || '',
    dayOfWeek: schedule.DayOfWeek,
    startTime: schedule.StartTime,
    endTime: schedule.EndTime,
    startDate: schedule.StartDate,
    endDate: schedule.EndDate,
    isActive: schedule.IsActive,
  }));

  return {
    schedules,
    totalSchedules: schedules.length,
  };
}

// Get visits for a specific class (attendance/booking history)
export async function getClassVisitsTool(
  classId: number,
  lastModifiedDate?: string,
  client: IMindbodyClient = mindbodyClient
): Promise<{
  classInfo: {
    id: number;
    name: string;
    instructor: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  visits: Array<{
    id: number;
    classId: number;
    clientId: string;
    clientFirstName: string;
    clientLastName: string;
    clientEmail?: string;
    clientPhone?: string;
    startDateTime: string;
    endDateTime: string;
    signedIn: boolean;
    webSignup: boolean;
    makeUp: boolean;
    lateCancel: boolean;
    serviceName?: string;
    serviceId?: number;
    locationId?: number;
    locationName?: string;
  }>;
  totalVisits: number;
  summary: {
    totalSignedIn: number;
    totalNotSignedIn: number;
    totalLateCancels: number;
    totalWebSignups: number;
  };
}> {
  const response = await client.get<any>('/class/classvisits', {
    params: {
      ClassId: classId,
      LastModifiedDate: lastModifiedDate,
    },
  });

  const classInfo = {
    id: response.Class?.Id || classId,
    name: response.Class?.ClassDescription?.Name || '',
    instructor: response.Class?.Staff?.DisplayName || `${response.Class?.Staff?.FirstName || ''} ${response.Class?.Staff?.LastName || ''}`.trim() || '',
    startTime: response.Class?.StartDateTime,
    endTime: response.Class?.EndDateTime,
    location: response.Class?.Location?.Name || '',
  };

  const visits = (response.Class?.Visits || []).map((visit: any) => ({
    id: visit.Id,
    classId: visit.ClassId || classId,
    clientId: visit.ClientId,
    clientFirstName: visit.Client?.FirstName || visit.FirstName || '',
    clientLastName: visit.Client?.LastName || visit.LastName || '',
    clientEmail: visit.Client?.Email || visit.Email,
    clientPhone: visit.Client?.MobilePhone || visit.Client?.HomePhone || visit.Phone,
    startDateTime: visit.StartDateTime,
    endDateTime: visit.EndDateTime,
    signedIn: visit.SignedIn || false,
    webSignup: visit.WebSignup || false,
    makeUp: visit.MakeUp || false,
    lateCancel: visit.LateCancelled || false,
    serviceName: visit.Service?.Name || visit.ServiceName,
    serviceId: visit.Service?.Id || visit.ServiceId,
    locationId: visit.Location?.Id || visit.LocationId,
    locationName: visit.Location?.Name || visit.LocationName,
  }));

  // Generate summary
  const summary = {
    totalSignedIn: visits.filter((v: any) => v.signedIn).length,
    totalNotSignedIn: visits.filter((v: any) => !v.signedIn && !v.lateCancel).length,
    totalLateCancels: visits.filter((v: any) => v.lateCancel).length,
    totalWebSignups: visits.filter((v: any) => v.webSignup).length,
  };

  return {
    classInfo,
    visits,
    totalVisits: visits.length,
    summary,
  };
}