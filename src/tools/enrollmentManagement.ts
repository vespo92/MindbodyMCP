import { mindbodyClient } from '../api/client';

// Get enrollments (courses, workshops, series)
export async function getEnrollmentsTool(
  locationIds?: number[],
  classScheduleIds?: number[],
  staffIds?: number[],
  programIds?: number[],
  sessionTypeIds?: number[],
  semesterIds?: number[],
  courseIds?: number[],
  startDate?: string,
  endDate?: string
): Promise<{
  enrollments: Array<{
    id: string;
    name: string;
    courseId?: number;
    courseName?: string;
    staffId: number;
    staffName: string;
    locationId: number;
    locationName: string;
    maxCapacity: number;
    webCapacity: number;
    totalBooked: number;
    webBooked: number;
    semesterId?: number;
    isAvailable: boolean;
    isWaitlistAvailable: boolean;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    dayOfWeek?: string;
    programId?: number;
    programName?: string;
    sessionTypeId?: number;
    sessionTypeName?: string;
    description?: string;
  }>;
  totalEnrollments: number;
}> {
  const response = await mindbodyClient.get<any>('/enrollment/enrollments', {
    params: {
      LocationIds: locationIds,
      ClassScheduleIds: classScheduleIds,
      StaffIds: staffIds,
      ProgramIds: programIds,
      SessionTypeIds: sessionTypeIds,
      SemesterIds: semesterIds,
      CourseIds: courseIds,
      StartDate: startDate || new Date().toISOString().split('T')[0],
      EndDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      Limit: 200,
    },
  });

  const enrollments = response.Enrollments.map((enrollment: any) => ({
    id: enrollment.Id,
    name: enrollment.Name,
    courseId: enrollment.CourseId,
    courseName: enrollment.CourseName,
    staffId: enrollment.StaffId || enrollment.Staff?.Id,
    staffName: enrollment.Staff?.Name || `${enrollment.Staff?.FirstName || ''} ${enrollment.Staff?.LastName || ''}`.trim() || '',
    locationId: enrollment.LocationId || enrollment.Location?.Id,
    locationName: enrollment.Location?.Name || '',
    maxCapacity: enrollment.MaxCapacity,
    webCapacity: enrollment.WebCapacity,
    totalBooked: enrollment.TotalBooked,
    webBooked: enrollment.WebBooked,
    semesterId: enrollment.SemesterId,
    isAvailable: enrollment.IsAvailable,
    isWaitlistAvailable: enrollment.IsWaitlistAvailable,
    startDate: enrollment.StartDate,
    endDate: enrollment.EndDate,
    startTime: enrollment.StartTime,
    endTime: enrollment.EndTime,
    dayOfWeek: enrollment.DayOfWeek,
    programId: enrollment.Program?.Id,
    programName: enrollment.Program?.Name,
    sessionTypeId: enrollment.SessionType?.Id,
    sessionTypeName: enrollment.SessionType?.Name,
    description: enrollment.Description,
  }));

  return {
    enrollments,
    totalEnrollments: response.PaginationResponse.TotalResults,
  };
}

// Add client to enrollment (register for course/workshop)
export async function addClientToEnrollmentTool(
  clientId: string,
  classScheduleIds: number[],
  enrollmentDateForward?: string,
  enrollmentDates?: string[],
  enroll: boolean = true,
  waitlist: boolean = false,
  sendEmail: boolean = true,
  testMode: boolean = false
): Promise<{
  success: boolean;
  enrollments?: Array<{
    enrollmentId: string;
    classId: number;
    clientId: string;
    enrollmentDate: string;
    enrollmentStatus: string;
    message?: string;
  }>;
  failedEnrollments?: Array<{
    classScheduleId: number;
    errorMessage: string;
  }>;
  message: string;
}> {
  try {
    const response = await mindbodyClient.post<any>('/enrollment/addclienttoenrollment', {
      ClientId: clientId,
      ClassScheduleIds: classScheduleIds,
      EnrollmentDateForward: enrollmentDateForward,
      EnrollmentDates: enrollmentDates,
      Enroll: enroll,
      Waitlist: waitlist,
      SendEmail: sendEmail,
      TestMode: testMode,
    });

    const successfulEnrollments = response.Enrollments?.filter((e: any) => e.Action === 'Added') || [];
    const failedEnrollments = response.Enrollments?.filter((e: any) => e.Action === 'Failed') || [];

    return {
      success: successfulEnrollments.length > 0,
      enrollments: successfulEnrollments.map((enrollment: any) => ({
        enrollmentId: enrollment.Id,
        classId: enrollment.ClassId,
        clientId: enrollment.ClientId,
        enrollmentDate: enrollment.EnrollmentDate,
        enrollmentStatus: enrollment.Action,
        message: enrollment.Message,
      })),
      failedEnrollments: failedEnrollments.map((enrollment: any) => ({
        classScheduleId: enrollment.ClassScheduleId,
        errorMessage: enrollment.Message || 'Failed to enroll',
      })),
      message: `Enrolled in ${successfulEnrollments.length} out of ${classScheduleIds.length} enrollments`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to add client to enrollment',
    };
  }
}

// Get client enrollments
export async function getClientEnrollmentsTool(
  clientId: string
): Promise<{
  enrollments: Array<{
    id: string;
    courseName: string;
    staffName: string;
    locationName: string;
    startDate: string;
    endDate: string;
    isWaitlisted: boolean;
    dateEnrolled: string;
    totalVisits?: number;
    attendedVisits?: number;
    remainingVisits?: number;
    absences?: number;
    lateCancel?: number;
  }>;
  totalEnrollments: number;
}> {
  const response = await mindbodyClient.get<any>('/client/clientenrollments', {
    params: {
      ClientId: clientId,
    },
  });

  const enrollments = response.Enrollments.map((enrollment: any) => ({
    id: enrollment.Id,
    courseName: enrollment.CourseName,
    staffName: enrollment.StaffName,
    locationName: enrollment.LocationName,
    startDate: enrollment.StartDate,
    endDate: enrollment.EndDate,
    isWaitlisted: enrollment.IsWaitlisted,
    dateEnrolled: enrollment.DateEnrolled,
    totalVisits: enrollment.TotalVisits,
    attendedVisits: enrollment.AttendedVisits,
    remainingVisits: enrollment.RemainingVisits,
    absences: enrollment.Absences,
    lateCancel: enrollment.LateCancel,
  }));

  return {
    enrollments,
    totalEnrollments: enrollments.length,
  };
}