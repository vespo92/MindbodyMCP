import { mindbodyClient } from '../api/client';
import { teacherCache, classCache } from '../cache/index';
import {
  GetStaffRequest,
  GetStaffResponse,
  GetClassesRequest,
  GetClassesResponse,
  Staff,
  TeacherSchedule,
} from '../types/mindbody';
import {
  getToday,
  getWeekFromDate,
  getDayOfWeek,
  formatTime,
  getDurationInMinutes,
  getDateOnly,
} from '../utils/dates';

async function findTeacherByName(name: string): Promise<Staff | null> {
  const cacheKey = `teacher:${name.toLowerCase()}`;
  const cached = teacherCache.get<Staff>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Search for staff members
  const request: GetStaffRequest = {
    Limit: 100,
  };

  const response = await mindbodyClient.get<GetStaffResponse>('/staff/staff', {
    params: request,
  });

  // Find matching teacher (case-insensitive)
  const teacher = response.StaffMembers.find(
    (staff) => staff.Name.toLowerCase() === name.toLowerCase() ||
              `${staff.FirstName} ${staff.LastName}`.toLowerCase() === name.toLowerCase()
  );

  if (teacher) {
    teacherCache.set(cacheKey, teacher);
  }

  return teacher || null;
}

export async function getTeacherScheduleTool(
  teacherName: string,
  startDate?: string,
  endDate?: string
): Promise<TeacherSchedule> {
  // Find the teacher
  const teacher = await findTeacherByName(teacherName);
  
  if (!teacher) {
    throw new Error(`Teacher "${teacherName}" not found. Please check the spelling and try again.`);
  }

  // Set date range
  const dateRange = startDate 
    ? { start: startDate, end: endDate || getWeekFromDate(startDate).end }
    : getWeekFromDate(getToday());

  // Check cache for classes
  const cacheKey = `classes:${teacher.Id}:${dateRange.start}:${dateRange.end}`;
  let classes = classCache.get<GetClassesResponse>(cacheKey);

  if (!classes) {
    // Fetch classes from API
    const request: GetClassesRequest = {
      StaffIds: [teacher.Id],
      StartDateTime: `${dateRange.start}T00:00:00`,
      EndDateTime: `${dateRange.end}T23:59:59`,
      Limit: 200, // Max allowed
    };

    classes = await mindbodyClient.get<GetClassesResponse>('/class/classes', {
      params: request,
    });

    classCache.set(cacheKey, classes);
  }

  // Process and format the results
  const formattedClasses = classes.Classes.map((cls) => ({
    id: cls.Id,
    name: cls.ClassDescription.Name,
    startTime: cls.StartDateTime,
    endTime: cls.EndDateTime,
    duration: getDurationInMinutes(cls.StartDateTime, cls.EndDateTime),
    location: cls.Location.Name,
    isSubstitute: cls.IsSubstitute,
    isCanceled: cls.IsCanceled,
    spotsAvailable: cls.MaxCapacity - cls.TotalBooked,
    totalSpots: cls.MaxCapacity,
  }));

  // Generate summaries
  const summary = {
    byDay: {} as Record<string, number>,
    byLocation: {} as Record<string, number>,
    byClassType: {} as Record<string, number>,
  };

  formattedClasses.forEach((cls) => {
    if (!cls.isCanceled) {
      // By day
      const day = getDayOfWeek(cls.startTime);
      summary.byDay[day] = (summary.byDay[day] || 0) + 1;

      // By location
      summary.byLocation[cls.location] = (summary.byLocation[cls.location] || 0) + 1;

      // By class type
      summary.byClassType[cls.name] = (summary.byClassType[cls.name] || 0) + 1;
    }
  });

  // Sort classes by start time
  formattedClasses.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return {
    teacher: {
      id: teacher.Id,
      name: teacher.Name,
      email: teacher.Email,
    },
    dateRange,
    totalClasses: formattedClasses.filter(c => !c.isCanceled).length,
    classes: formattedClasses,
    summary,
  };
}
