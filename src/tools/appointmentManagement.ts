import { mindbodyClient } from '../api/client';

// Get appointments
export async function getStaffAppointmentsTool(
  staffIds: number[],
  locationIds?: number[],
  startDate?: string,
  endDate?: string,
  appointmentIds?: number[],
  clientIds?: string[]
): Promise<{
  appointments: Array<{
    id: number;
    status: string;
    staffId: number;
    staffName: string;
    sessionTypeId: number;
    sessionTypeName: string;
    locationId: number;
    locationName: string;
    startDateTime: string;
    endDateTime: string;
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    notes?: string;
    staffRequested: boolean;
    providerId?: string;
    duration: number;
    confirmed?: boolean;
    firstAppointment: boolean;
    resources?: Array<{ id: number; name: string }>;
  }>;
  totalAppointments: number;
}> {
  const response = await mindbodyClient.get<any>('/appointment/staffappointments', {
    params: {
      StaffIds: staffIds,
      LocationIds: locationIds,
      StartDate: startDate || new Date().toISOString().split('T')[0],
      EndDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      AppointmentIds: appointmentIds,
      ClientIds: clientIds,
      Limit: 200,
    },
  });

  const appointments = response.Appointments.map((apt: any) => ({
    id: apt.Id,
    status: apt.Status,
    staffId: apt.Staff.Id,
    staffName: apt.Staff.Name,
    sessionTypeId: apt.SessionType.Id,
    sessionTypeName: apt.SessionType.Name,
    locationId: apt.Location.Id,
    locationName: apt.Location.Name,
    startDateTime: apt.StartDateTime,
    endDateTime: apt.EndDateTime,
    clientId: apt.Client?.Id,
    clientName: apt.Client ? `${apt.Client.FirstName} ${apt.Client.LastName}` : undefined,
    clientEmail: apt.Client?.Email,
    clientPhone: apt.Client?.MobilePhone,
    notes: apt.Notes,
    staffRequested: apt.StaffRequested,
    providerId: apt.ProviderId,
    duration: apt.Duration,
    confirmed: apt.Confirmed,
    firstAppointment: apt.FirstAppointment,
    resources: apt.Resources?.map((r: any) => ({ id: r.Id, name: r.Name })),
  }));

  return {
    appointments,
    totalAppointments: response.PaginationResponse.TotalResults,
  };
}

// Add appointment
export async function addAppointmentTool(
  clientId: string,
  staffId: number,
  locationId: number,
  sessionTypeId: number,
  startDateTime: string,
  resourceIds?: number[],
  notes?: string,
  staffRequested?: boolean,
  executePayment?: boolean,
  sendEmail?: boolean,
  applyPayment?: boolean
): Promise<{
  success: boolean;
  appointment?: {
    id: number;
    status: string;
    startDateTime: string;
    endDateTime: string;
    duration: number;
    staffName: string;
    sessionTypeName: string;
    locationName: string;
  };
  message: string;
}> {
  try {
    const response = await mindbodyClient.post<any>('/appointment/addappointment', {
      ClientId: clientId,
      StaffId: staffId,
      LocationId: locationId,
      SessionTypeId: sessionTypeId,
      StartDateTime: startDateTime,
      ResourceIds: resourceIds,
      Notes: notes,
      StaffRequested: staffRequested,
      ExecutePayment: executePayment,
      SendEmail: sendEmail,
      ApplyPayment: applyPayment,
    });

    return {
      success: true,
      appointment: {
        id: response.Appointment.Id,
        status: response.Appointment.Status,
        startDateTime: response.Appointment.StartDateTime,
        endDateTime: response.Appointment.EndDateTime,
        duration: response.Appointment.Duration,
        staffName: response.Appointment.Staff.Name,
        sessionTypeName: response.Appointment.SessionType.Name,
        locationName: response.Appointment.Location.Name,
      },
      message: response.Message || 'Appointment booked successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to book appointment',
    };
  }
}

// Update appointment
export async function updateAppointmentTool(
  appointmentId: number,
  staffId?: number,
  startDateTime?: string,
  endDateTime?: string,
  resourceIds?: number[],
  notes?: string,
  executePayment?: boolean,
  sendEmail?: boolean,
  applyPayment?: boolean
): Promise<{
  success: boolean;
  appointment?: {
    id: number;
    status: string;
    startDateTime: string;
    endDateTime: string;
    staffName: string;
  };
  message: string;
}> {
  try {
    const response = await mindbodyClient.post<any>('/appointment/updateappointment', {
      AppointmentId: appointmentId,
      StaffId: staffId,
      StartDateTime: startDateTime,
      EndDateTime: endDateTime,
      ResourceIds: resourceIds,
      Notes: notes,
      ExecutePayment: executePayment,
      SendEmail: sendEmail,
      ApplyPayment: applyPayment,
    });

    return {
      success: true,
      appointment: {
        id: response.Appointment.Id,
        status: response.Appointment.Status,
        startDateTime: response.Appointment.StartDateTime,
        endDateTime: response.Appointment.EndDateTime,
        staffName: response.Appointment.Staff.Name,
      },
      message: 'Appointment updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update appointment',
    };
  }
}

// Get bookable items (services available for appointment booking)
export async function getBookableItemsTool(
  sessionTypeIds: number[],
  locationIds?: number[],
  staffIds?: number[],
  startDate?: string,
  endDate?: string,
  appointmentId?: number
): Promise<{
  bookableItems: Array<{
    scheduledItemId: number;
    staffId: number;
    staffName: string;
    sessionTypeId: number;
    sessionTypeName: string;
    locationId: number;
    locationName: string;
    startDateTime: string;
    endDateTime: string;
    isAvailable: boolean;
    isSingleSessionBookable?: boolean;
  }>;
  totalItems: number;
}> {
  const response = await mindbodyClient.get<any>('/appointment/bookableitems', {
    params: {
      SessionTypeIds: sessionTypeIds,
      LocationIds: locationIds,
      StaffIds: staffIds,
      StartDate: startDate || new Date().toISOString().split('T')[0],
      EndDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      AppointmentId: appointmentId,
      Limit: 200,
    },
  });

  const bookableItems = response.BookableItems.map((item: any) => ({
    scheduledItemId: item.ScheduledItemId,
    staffId: item.Staff.Id,
    staffName: item.Staff.Name,
    sessionTypeId: item.SessionType.Id,
    sessionTypeName: item.SessionType.Name,
    locationId: item.Location.Id,
    locationName: item.Location.Name,
    startDateTime: item.StartDateTime,
    endDateTime: item.EndDateTime,
    isAvailable: item.IsAvailable,
    isSingleSessionBookable: item.IsSingleSessionBookable,
  }));

  return {
    bookableItems,
    totalItems: bookableItems.length,
  };
}

// Get active session times (availability)
export async function getActiveSessionTimesTool(
  scheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment',
  sessionTypeIds?: number[],
  startTime?: string,
  endTime?: string,
  days?: string[] // ['Sunday', 'Monday', etc.]
): Promise<{
  activeTimes: Array<{
    id: number;
    sessionTypeId: number;
    sessionTypeName: string;
    scheduleType: string;
    monday?: { startTime: string; endTime: string; bookable: boolean };
    tuesday?: { startTime: string; endTime: string; bookable: boolean };
    wednesday?: { startTime: string; endTime: string; bookable: boolean };
    thursday?: { startTime: string; endTime: string; bookable: boolean };
    friday?: { startTime: string; endTime: string; bookable: boolean };
    saturday?: { startTime: string; endTime: string; bookable: boolean };
    sunday?: { startTime: string; endTime: string; bookable: boolean };
  }>;
  totalActiveTimes: number;
}> {
  const response = await mindbodyClient.get<any>('/appointment/activesessiontimes', {
    params: {
      ScheduleType: scheduleType || 'All',
      SessionTypeIds: sessionTypeIds,
      StartTime: startTime,
      EndTime: endTime,
      Days: days,
    },
  });

  const activeTimes = response.ActiveSessionTimes.map((time: any) => {
    const result: any = {
      id: time.Id,
      sessionTypeId: time.SessionType.Id,
      sessionTypeName: time.SessionType.Name,
      scheduleType: time.ScheduleType,
    };

    // Map day schedules
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
      const dayData = time[day];
      if (dayData) {
        result[day.toLowerCase()] = {
          startTime: dayData.StartTime,
          endTime: dayData.EndTime,
          bookable: dayData.Bookable,
        };
      }
    });

    return result;
  });

  return {
    activeTimes,
    totalActiveTimes: activeTimes.length,
  };
}

// Get schedule items (appointments in a schedule)
export async function getScheduleItemsTool(
  locationIds?: number[],
  staffIds?: number[],
  startDate?: string,
  endDate?: string,
  ignorePrepFinishBuffer: boolean = false
): Promise<{
  scheduleItems: Array<{
    id: number;
    isAvailable: boolean;
    isUnavailable: boolean;
    staffId: number;
    staffName: string;
    sessionTypeId: number;
    sessionTypeName: string;
    locationId: number;
    locationName: string;
    startDateTime: string;
    endDateTime: string;
  }>;
  totalItems: number;
}> {
  const response = await mindbodyClient.get<any>('/appointment/scheduleitems', {
    params: {
      LocationIds: locationIds,
      StaffIds: staffIds,
      StartDate: startDate || new Date().toISOString().split('T')[0],
      EndDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      IgnorePrepFinishBuffer: ignorePrepFinishBuffer,
      Limit: 200,
    },
  });

  const scheduleItems = response.StaffMembers.flatMap((staff: any) => 
    staff.Appointments.map((apt: any) => ({
      id: apt.Id,
      isAvailable: apt.IsAvailable,
      isUnavailable: apt.Unavailable,
      staffId: staff.Id,
      staffName: staff.Name,
      sessionTypeId: apt.SessionType?.Id,
      sessionTypeName: apt.SessionType?.Name,
      locationId: apt.Location?.Id,
      locationName: apt.Location?.Name,
      startDateTime: apt.StartDateTime,
      endDateTime: apt.EndDateTime,
    }))
  );

  return {
    scheduleItems,
    totalItems: scheduleItems.length,
  };
}