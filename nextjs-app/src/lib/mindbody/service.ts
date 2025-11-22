import { MindbodyApiClient, getMindbodyClient } from './client';
import type {
  // Site & Location
  Site, Location, Resource,
  // Staff
  Staff, GetStaffParams,
  // Client
  Client, GetClientsParams, AddClientParams, UpdateClientParams,
  ClientVisit, ClientMembership, ClientContract, GetClientVisitsParams,
  // Class
  ClassDescription, Class, ClassSchedule, GetClassesParams,
  AddClientToClassParams, RemoveClientFromClassParams, WaitlistEntry, SubstituteTeacherParams,
  // Appointment
  Appointment, GetAppointmentsParams, AddAppointmentParams, UpdateAppointmentParams,
  BookableItem, GetBookableItemsParams, ScheduleItem, ActiveSessionTime,
  // Enrollment
  Enrollment, GetEnrollmentsParams, AddClientToEnrollmentParams,
  // Sales
  Service, Package, Product, Contract,
  GetServicesParams, GetProductsParams, GetContractsParams,
  CheckoutParams, ShoppingCartResult, PurchaseContractParams,
  // Program & Session Type
  Program, SessionType, GetProgramsParams, GetSessionTypesParams,
  // Utility
  TeacherSchedule, OperationResult, ListResult, VisitSummary,
} from './types';

// ============================================================================
// UNIFIED MINDBODY SERVICE - All API Operations in One Place
// ============================================================================

export class MindbodyService {
  private client: MindbodyApiClient;

  constructor(client?: MindbodyApiClient) {
    this.client = client || getMindbodyClient();
  }

  // ==========================================================================
  // SITE & LOCATION MANAGEMENT
  // ==========================================================================

  async getSites(): Promise<ListResult<Site>> {
    const response = await this.client.get<any>('/site/sites');
    const sites = response.Sites.map((site: any) => ({
      id: site.Id,
      name: site.Name,
      description: site.Description,
      logoUrl: site.LogoUrl,
      contactEmail: site.ContactEmail,
      acceptsVisa: site.AcceptsVisa ?? true,
      acceptsMastercard: site.AcceptsMastercard ?? true,
      acceptsAmex: site.AcceptsAmex ?? true,
      acceptsDiscover: site.AcceptsDiscover ?? true,
      allowsDirectPay: site.AllowsDirectPay ?? false,
      smsPackageEnabled: site.SmsPackageEnabled ?? false,
    }));
    return { items: sites, total: sites.length };
  }

  async getLocations(): Promise<ListResult<Location>> {
    const response = await this.client.get<any>('/site/locations');
    const locations = response.Locations.map((loc: any) => ({
      id: loc.Id,
      name: loc.Name,
      description: loc.Description,
      address: loc.Address,
      address2: loc.Address2,
      city: loc.City,
      state: loc.StateProvCode,
      postalCode: loc.PostalCode,
      country: loc.Country,
      phone: loc.Phone,
      latitude: loc.Latitude,
      longitude: loc.Longitude,
      hasClasses: loc.HasClasses ?? true,
    }));
    return { items: locations, total: locations.length };
  }

  async getResources(): Promise<ListResult<Resource>> {
    const response = await this.client.get<any>('/site/resources');
    const resources = response.Resources.map((res: any) => ({
      id: res.Id,
      name: res.Name,
    }));
    return { items: resources, total: resources.length };
  }

  async getActivationCode(): Promise<{ activationCode: string; activationLink: string }> {
    const response = await this.client.get<any>('/site/activationcode');
    return {
      activationCode: response.ActivationCode,
      activationLink: response.ActivationLink,
    };
  }

  // ==========================================================================
  // PROGRAM & SESSION TYPE MANAGEMENT
  // ==========================================================================

  async getPrograms(params?: GetProgramsParams): Promise<ListResult<Program>> {
    const response = await this.client.get<any>('/site/programs', {
      params: {
        ScheduleType: params?.scheduleType,
        OnlineOnly: params?.onlineOnly,
        Limit: params?.limit || 200,
      },
    });
    const programs = response.Programs.map((prog: any) => ({
      id: prog.Id,
      name: prog.Name,
      scheduleType: prog.ScheduleType,
      cancelOffset: prog.CancelOffset,
      contentFormats: prog.ContentFormats || [],
    }));
    return { items: programs, total: programs.length };
  }

  async getSessionTypes(params?: GetSessionTypesParams): Promise<ListResult<SessionType>> {
    const response = await this.client.get<any>('/site/sessiontypes', {
      params: {
        ProgramIds: params?.programIds,
        OnlineOnly: params?.onlineOnly,
        Limit: params?.limit || 200,
      },
    });
    const sessionTypes = response.SessionTypes.map((st: any) => ({
      id: st.Id,
      name: st.Name,
      type: st.Type,
      defaultTimeLength: st.DefaultTimeLength,
      numDeducted: st.NumDeducted,
      programId: st.ProgramId,
      onlineDescription: st.OnlineDescription,
      category: st.Category,
      subcategory: st.Subcategory,
    }));
    return { items: sessionTypes, total: sessionTypes.length };
  }

  // ==========================================================================
  // STAFF MANAGEMENT
  // ==========================================================================

  async getStaff(params?: GetStaffParams): Promise<ListResult<Staff>> {
    const response = await this.client.get<any>('/staff/staff', {
      params: {
        StaffIds: params?.staffIds,
        Filters: params?.filters,
        SessionTypeIds: params?.sessionTypeIds,
        LocationIds: params?.locationIds,
        StartDateTime: params?.startDateTime,
        Limit: params?.limit || 200,
        Offset: params?.offset,
      },
    });
    const staff = response.StaffMembers.map((s: any) => ({
      id: s.Id,
      firstName: s.FirstName,
      lastName: s.LastName,
      name: s.Name || `${s.FirstName} ${s.LastName}`,
      email: s.Email,
      mobilePhone: s.MobilePhone,
      imageUrl: s.ImageUrl,
      bio: s.Bio,
      isMale: s.isMale,
      appointmentTrn: s.AppointmentTrn,
      independentContractor: s.IndependentContractor,
    }));
    return { items: staff, total: response.PaginationResponse?.TotalResults || staff.length };
  }

  async getStaffById(staffId: number): Promise<Staff | null> {
    const result = await this.getStaff({ staffIds: [staffId] });
    return result.items[0] || null;
  }

  // ==========================================================================
  // CLIENT MANAGEMENT
  // ==========================================================================

  async getClients(params?: GetClientsParams): Promise<ListResult<Client>> {
    const response = await this.client.get<any>('/client/clients', {
      params: {
        SearchText: params?.searchText,
        ClientIds: params?.clientIds,
        LastModifiedDate: params?.lastModifiedDate,
        IsProspect: params?.isProspect,
        Limit: params?.limit || 200,
        Offset: params?.offset,
      },
    });
    const clients = response.Clients.map((c: any) => ({
      id: c.Id,
      firstName: c.FirstName,
      lastName: c.LastName,
      email: c.Email,
      phone: c.MobilePhone || c.HomePhone,
      mobilePhone: c.MobilePhone,
      homePhone: c.HomePhone,
      birthDate: c.BirthDate,
      addressLine1: c.AddressLine1,
      addressLine2: c.AddressLine2,
      city: c.City,
      state: c.State,
      postalCode: c.PostalCode,
      country: c.Country,
      gender: c.Gender,
      isProspect: c.IsProspect ?? false,
      isCompany: c.IsCompany ?? false,
      status: c.Status || 'Active',
      active: c.Active ?? true,
      sendAccountEmails: c.SendAccountEmails ?? true,
      referredBy: c.ReferredBy,
      photoUrl: c.PhotoUrl,
      notes: c.Notes,
      emergencyContact: c.EmergencyContactInfoName ? {
        name: c.EmergencyContactInfoName,
        phone: c.EmergencyContactInfoPhone,
        relationship: c.EmergencyContactInfoRelationship,
      } : undefined,
      liability: c.LiabilityRelease ? {
        isReleased: c.LiabilityRelease.IsReleased,
        agreedDate: c.LiabilityRelease.AgreementDate,
      } : undefined,
      accountBalance: c.AccountBalance || 0,
      creationDate: c.CreationDate,
      membershipIcon: c.MembershipIcon,
    }));
    return { items: clients, total: response.PaginationResponse?.TotalResults || clients.length };
  }

  async getClientById(clientId: string): Promise<Client | null> {
    const result = await this.getClients({ clientIds: [clientId] });
    return result.items[0] || null;
  }

  async addClient(params: AddClientParams): Promise<OperationResult<Client>> {
    try {
      const response = await this.client.post<any>('/client/addclient', {
        FirstName: params.firstName,
        LastName: params.lastName,
        Email: params.email,
        MobilePhone: params.mobilePhone,
        BirthDate: params.birthDate,
        AddressLine1: params.addressLine1,
        City: params.city,
        State: params.state,
        PostalCode: params.postalCode,
        Country: params.country,
        EmergencyContactInfoName: params.emergencyContactName,
        EmergencyContactInfoPhone: params.emergencyContactPhone,
        EmergencyContactInfoRelationship: params.emergencyContactRelationship,
        SendAccountEmails: params.sendAccountEmails ?? true,
        ReferredBy: params.referredBy,
      });

      return {
        success: true,
        data: {
          id: response.Client.Id,
          firstName: response.Client.FirstName,
          lastName: response.Client.LastName,
          email: response.Client.Email,
          phone: response.Client.MobilePhone,
          isProspect: response.Client.IsProspect ?? false,
          isCompany: false,
          status: response.Client.Status || 'Active',
          active: true,
          sendAccountEmails: true,
          accountBalance: 0,
        },
        message: 'Client created successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create client' };
    }
  }

  async updateClient(params: UpdateClientParams): Promise<OperationResult<Client>> {
    try {
      const updateData: any = { Id: params.clientId };
      if (params.firstName) updateData.FirstName = params.firstName;
      if (params.lastName) updateData.LastName = params.lastName;
      if (params.email) updateData.Email = params.email;
      if (params.mobilePhone) updateData.MobilePhone = params.mobilePhone;
      if (params.birthDate) updateData.BirthDate = params.birthDate;
      if (params.addressLine1) updateData.AddressLine1 = params.addressLine1;
      if (params.city) updateData.City = params.city;
      if (params.state) updateData.State = params.state;
      if (params.postalCode) updateData.PostalCode = params.postalCode;
      if (params.emergencyContactName) updateData.EmergencyContactInfoName = params.emergencyContactName;
      if (params.emergencyContactPhone) updateData.EmergencyContactInfoPhone = params.emergencyContactPhone;
      if (params.sendAccountEmails !== undefined) updateData.SendAccountEmails = params.sendAccountEmails;

      const response = await this.client.post<any>('/client/updateclient', updateData);

      return {
        success: true,
        data: {
          id: response.Client.Id,
          firstName: response.Client.FirstName,
          lastName: response.Client.LastName,
          email: response.Client.Email,
          phone: response.Client.MobilePhone,
          isProspect: response.Client.IsProspect ?? false,
          isCompany: false,
          status: response.Client.Status || 'Active',
          active: true,
          sendAccountEmails: true,
          accountBalance: 0,
        },
        message: 'Client updated successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update client' };
    }
  }

  async getClientVisits(params: GetClientVisitsParams): Promise<{ visits: ClientVisit[]; total: number; summary: VisitSummary }> {
    const defaultStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEnd = new Date().toISOString().split('T')[0];

    const response = await this.client.get<any>('/client/clientvisits', {
      params: {
        ClientId: params.clientId,
        StartDate: params.startDate || defaultStart,
        EndDate: params.endDate || defaultEnd,
        Limit: 200,
      },
    });

    const visits: ClientVisit[] = response.Visits.map((v: any) => ({
      id: v.Id,
      classId: v.ClassId,
      className: v.Name,
      startTime: v.StartDateTime,
      endTime: v.EndDateTime,
      location: v.Location?.Name || 'Unknown',
      instructor: v.Staff?.Name || 'Unknown',
      signedIn: v.SignedIn,
      webSignup: v.WebSignup,
      lateCancel: v.LateCancelled,
      serviceId: v.ServiceId,
      serviceName: v.ServiceName,
    }));

    // Generate summary
    const summary: VisitSummary = {
      totalAttended: visits.filter(v => v.signedIn).length,
      totalNoShows: visits.filter(v => !v.signedIn && !v.lateCancel).length,
      totalLateCancels: visits.filter(v => v.lateCancel).length,
      byLocation: {},
      byClassType: {},
      byInstructor: {},
    };

    visits.forEach((visit) => {
      if (visit.signedIn) {
        summary.byLocation[visit.location] = (summary.byLocation[visit.location] || 0) + 1;
        summary.byClassType[visit.className] = (summary.byClassType[visit.className] || 0) + 1;
        summary.byInstructor[visit.instructor] = (summary.byInstructor[visit.instructor] || 0) + 1;
      }
    });

    return { visits, total: visits.length, summary };
  }

  async getClientMemberships(clientId: string, locationId?: number): Promise<ListResult<ClientMembership>> {
    const response = await this.client.get<any>('/client/activeclientmemberships', {
      params: { ClientId: clientId, LocationId: locationId },
    });
    const memberships = response.ClientMemberships.map((m: any) => ({
      id: m.Id,
      name: m.Name,
      remainingClasses: m.Remaining,
      activeDate: m.ActiveDate,
      expirationDate: m.ExpirationDate,
      paymentDate: m.PaymentDate,
      program: m.Program,
      siteId: m.SiteId,
      iconCode: m.IconCode,
      action: m.Action,
    }));
    return { items: memberships, total: memberships.length };
  }

  async getClientContracts(clientId: string): Promise<ListResult<ClientContract>> {
    const response = await this.client.get<any>('/client/clientcontracts', {
      params: { ClientId: clientId },
    });
    const contracts = response.Contracts.map((c: any) => ({
      id: c.Id,
      name: c.ContractName,
      description: c.Description,
      soldDate: c.SoldDate,
      startDate: c.StartDate,
      endDate: c.EndDate,
      autopayStatus: c.AutopayStatus,
      balance: c.Balance,
      contractType: c.ContractType,
      siteId: c.SiteId,
    }));
    return { items: contracts, total: contracts.length };
  }

  async getClientAccountBalances(clientId: string): Promise<{ accountBalance: number; creditCardBalances: Array<{ amount: number; cardType: string; lastFour: string }> }> {
    const response = await this.client.get<any>('/client/clientaccountbalances', {
      params: { ClientIds: [clientId] },
    });
    const client = response.Clients[0];
    return {
      accountBalance: client?.AccountBalance || 0,
      creditCardBalances: client?.ClientCreditCards?.map((card: any) => ({
        amount: card.Balance || 0,
        cardType: card.CardType,
        lastFour: card.LastFour,
      })) || [],
    };
  }

  async addClientArrival(clientId: string, locationId: number): Promise<OperationResult<{ arrivalAdded: boolean }>> {
    try {
      const response = await this.client.post<any>('/client/addarrival', {
        ClientId: clientId,
        LocationId: locationId,
      });
      return {
        success: true,
        data: { arrivalAdded: response.ArrivalAdded },
        message: response.Message || 'Client checked in successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to check in client' };
    }
  }

  // ==========================================================================
  // CLASS MANAGEMENT
  // ==========================================================================

  async getClasses(params?: GetClassesParams): Promise<ListResult<Class>> {
    const response = await this.client.get<any>('/class/classes', {
      params: {
        ClassDescriptionIds: params?.classDescriptionIds,
        ClassIds: params?.classIds,
        StaffIds: params?.staffIds,
        StartDateTime: params?.startDateTime,
        EndDateTime: params?.endDateTime,
        LocationIds: params?.locationIds,
        Limit: params?.limit || 200,
        Offset: params?.offset,
      },
    });
    const classes = response.Classes.map((c: any) => ({
      id: c.Id,
      classScheduleId: c.ClassScheduleId,
      location: {
        id: c.Location.Id,
        name: c.Location.Name,
        description: c.Location.Description,
        hasClasses: true,
      },
      classDescription: {
        id: c.ClassDescription.Id,
        name: c.ClassDescription.Name,
        description: c.ClassDescription.Description,
        imageUrl: c.ClassDescription.ImageUrl,
        active: true,
      },
      staff: {
        id: c.Staff.Id,
        firstName: c.Staff.FirstName,
        lastName: c.Staff.LastName,
        name: c.Staff.Name || `${c.Staff.FirstName} ${c.Staff.LastName}`,
        email: c.Staff.Email,
        imageUrl: c.Staff.ImageUrl,
      },
      startDateTime: c.StartDateTime,
      endDateTime: c.EndDateTime,
      isCanceled: c.IsCanceled,
      isWaitlistAvailable: c.IsWaitlistAvailable,
      isAvailable: c.IsAvailable,
      isSubstitute: c.IsSubstitute,
      maxCapacity: c.MaxCapacity,
      totalBooked: c.TotalBooked,
      webCapacity: c.WebCapacity,
      totalBookedWaitlist: c.TotalBookedWaitlist,
      virtualStreamLink: c.VirtualStreamLink,
    }));
    return { items: classes, total: response.PaginationResponse?.TotalResults || classes.length };
  }

  async getClassById(classId: number): Promise<Class | null> {
    const result = await this.getClasses({ classIds: [classId] });
    return result.items[0] || null;
  }

  async getClassDescriptions(): Promise<ListResult<ClassDescription>> {
    const response = await this.client.get<any>('/class/classdescriptions');
    const descriptions = response.ClassDescriptions.map((cd: any) => ({
      id: cd.Id,
      name: cd.Name,
      description: cd.Description,
      imageUrl: cd.ImageUrl,
      category: cd.Category,
      subcategory: cd.Subcategory,
      active: cd.Active ?? true,
    }));
    return { items: descriptions, total: descriptions.length };
  }

  async getClassSchedules(params?: { locationIds?: number[]; classDescriptionIds?: number[]; staffIds?: number[]; startDate?: string; endDate?: string }): Promise<ListResult<ClassSchedule>> {
    const response = await this.client.get<any>('/class/classschedules', {
      params: {
        LocationIds: params?.locationIds,
        ClassDescriptionIds: params?.classDescriptionIds,
        StaffIds: params?.staffIds,
        StartDate: params?.startDate,
        EndDate: params?.endDate,
        Limit: 200,
      },
    });
    const schedules = response.ClassSchedules.map((cs: any) => ({
      id: cs.Id,
      locationId: cs.Location?.Id,
      classDescriptionId: cs.ClassDescription?.Id,
      staffId: cs.Staff?.Id,
      startTime: cs.StartTime,
      endTime: cs.EndTime,
      startDate: cs.StartDate,
      endDate: cs.EndDate,
      daysOfWeek: cs.DaysOfWeek || [],
      maxCapacity: cs.MaxCapacity,
      webCapacity: cs.WebCapacity,
      isActive: cs.IsActive ?? true,
    }));
    return { items: schedules, total: schedules.length };
  }

  async addClientToClass(params: AddClientToClassParams): Promise<OperationResult<{ visit: { id: number; classId: number; clientId: string } }>> {
    try {
      const response = await this.client.post<any>('/class/addclienttoclass', {
        ClientId: params.clientId,
        ClassId: params.classId,
        RequirePayment: params.requirePayment,
        Waitlist: params.waitlist,
        SendEmail: params.sendEmail,
      });
      return {
        success: true,
        data: {
          visit: {
            id: response.Visit?.Id || 0,
            classId: params.classId,
            clientId: params.clientId,
          },
        },
        message: 'Client added to class successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to add client to class' };
    }
  }

  async removeClientFromClass(params: RemoveClientFromClassParams): Promise<OperationResult> {
    try {
      await this.client.post<any>('/class/removeclientfromclass', {
        ClientId: params.clientId,
        ClassId: params.classId,
        LateCancel: params.lateCancel,
        SendEmail: params.sendEmail,
      });
      return { success: true, message: 'Client removed from class successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to remove client from class' };
    }
  }

  async getWaitlistEntries(classIds?: number[], clientIds?: string[], hidePastEntries?: boolean): Promise<ListResult<WaitlistEntry>> {
    const response = await this.client.get<any>('/class/waitlistentries', {
      params: {
        ClassIds: classIds,
        ClientIds: clientIds,
        HidePastEntries: hidePastEntries,
        Limit: 200,
      },
    });
    const entries = response.WaitlistEntries.map((entry: any) => ({
      id: entry.Id,
      classId: entry.ClassId,
      clientId: entry.Client?.Id,
      clientName: entry.Client ? `${entry.Client.FirstName} ${entry.Client.LastName}` : 'Unknown',
      requestDateTime: entry.RequestDateTime,
      visitRefNo: entry.VisitRefNo,
      webSignup: entry.WebSignup,
    }));
    return { items: entries, total: entries.length };
  }

  async substituteClassTeacher(params: SubstituteTeacherParams): Promise<OperationResult> {
    try {
      await this.client.post<any>('/class/substituteclassteacher', {
        ClassId: params.classId,
        SubstituteStaffId: params.staffId,
        SendClientEmail: params.sendClientEmail,
        SendOriginalTeacherEmail: params.sendOriginalTeacherEmail,
        SendSubstituteTeacherEmail: params.sendSubstituteTeacherEmail,
      });
      return { success: true, message: 'Teacher substituted successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to substitute teacher' };
    }
  }

  // ==========================================================================
  // TEACHER SCHEDULE (OPTIMIZED)
  // ==========================================================================

  async getTeacherSchedule(teacherId: number, startDate?: string, endDate?: string): Promise<TeacherSchedule> {
    const today = new Date().toISOString().split('T')[0];
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const start = startDate || today;
    const end = endDate || weekFromNow;

    const [staffResult, classesResult] = await Promise.all([
      this.getStaff({ staffIds: [teacherId] }),
      this.getClasses({ staffIds: [teacherId], startDateTime: start, endDateTime: end }),
    ]);

    const teacher = staffResult.items[0];
    if (!teacher) {
      throw new Error(`Teacher with ID ${teacherId} not found`);
    }

    const classes = classesResult.items;
    const summary = {
      byDay: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      byClassType: {} as Record<string, number>,
    };

    classes.forEach((c) => {
      const day = new Date(c.startDateTime).toLocaleDateString('en-US', { weekday: 'long' });
      summary.byDay[day] = (summary.byDay[day] || 0) + 1;
      summary.byLocation[c.location.name] = (summary.byLocation[c.location.name] || 0) + 1;
      summary.byClassType[c.classDescription.name] = (summary.byClassType[c.classDescription.name] || 0) + 1;
    });

    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
      },
      dateRange: { start, end },
      totalClasses: classes.length,
      classes: classes.map((c) => {
        const startTime = new Date(c.startDateTime);
        const endTime = new Date(c.endDateTime);
        return {
          id: c.id,
          name: c.classDescription.name,
          startTime: c.startDateTime,
          endTime: c.endDateTime,
          duration: Math.round((endTime.getTime() - startTime.getTime()) / 60000),
          location: c.location.name,
          isSubstitute: c.isSubstitute,
          isCanceled: c.isCanceled,
          spotsAvailable: c.maxCapacity - c.totalBooked,
          totalSpots: c.maxCapacity,
        };
      }),
      summary,
    };
  }

  // ==========================================================================
  // APPOINTMENT MANAGEMENT
  // ==========================================================================

  async getAppointments(params: GetAppointmentsParams): Promise<ListResult<Appointment>> {
    const defaultStart = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await this.client.get<any>('/appointment/staffappointments', {
      params: {
        StaffIds: params.staffIds,
        LocationIds: params.locationIds,
        StartDate: params.startDate || defaultStart,
        EndDate: params.endDate || defaultEnd,
        AppointmentIds: params.appointmentIds,
        ClientIds: params.clientIds,
        Limit: params.limit || 200,
      },
    });

    const appointments = response.Appointments.map((apt: any) => ({
      id: apt.Id,
      status: apt.Status,
      staffId: apt.StaffId || apt.Staff?.Id,
      staffName: apt.Staff?.Name || `${apt.Staff?.FirstName || ''} ${apt.Staff?.LastName || ''}`.trim(),
      sessionTypeId: apt.SessionTypeId || apt.SessionType?.Id,
      sessionTypeName: apt.SessionType?.Name || '',
      locationId: apt.LocationId || apt.Location?.Id,
      locationName: apt.Location?.Name || '',
      startDateTime: apt.StartDateTime,
      endDateTime: apt.EndDateTime,
      clientId: apt.ClientId || apt.Client?.Id,
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

    return { items: appointments, total: response.PaginationResponse?.TotalResults || appointments.length };
  }

  async addAppointment(params: AddAppointmentParams): Promise<OperationResult<Appointment>> {
    try {
      const response = await this.client.post<any>('/appointment/addappointment', {
        ClientId: params.clientId,
        StaffId: params.staffId,
        LocationId: params.locationId,
        SessionTypeId: params.sessionTypeId,
        StartDateTime: params.startDateTime,
        ResourceIds: params.resourceIds,
        Notes: params.notes,
        StaffRequested: params.staffRequested,
        ExecutePayment: params.executePayment,
        SendEmail: params.sendEmail,
        ApplyPayment: params.applyPayment,
      });

      return {
        success: true,
        data: {
          id: response.Appointment.Id,
          status: response.Appointment.Status,
          staffId: response.Appointment.Staff?.Id,
          staffName: response.Appointment.Staff?.Name || '',
          sessionTypeId: response.Appointment.SessionType?.Id,
          sessionTypeName: response.Appointment.SessionType?.Name || '',
          locationId: response.Appointment.Location?.Id,
          locationName: response.Appointment.Location?.Name || '',
          startDateTime: response.Appointment.StartDateTime,
          endDateTime: response.Appointment.EndDateTime,
          duration: response.Appointment.Duration,
          staffRequested: response.Appointment.StaffRequested,
          firstAppointment: response.Appointment.FirstAppointment,
        },
        message: 'Appointment booked successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to book appointment' };
    }
  }

  async updateAppointment(params: UpdateAppointmentParams): Promise<OperationResult<Appointment>> {
    try {
      const response = await this.client.post<any>('/appointment/updateappointment', {
        AppointmentId: params.appointmentId,
        StaffId: params.staffId,
        StartDateTime: params.startDateTime,
        EndDateTime: params.endDateTime,
        ResourceIds: params.resourceIds,
        Notes: params.notes,
        ExecutePayment: params.executePayment,
        SendEmail: params.sendEmail,
        ApplyPayment: params.applyPayment,
      });

      return {
        success: true,
        data: {
          id: response.Appointment.Id,
          status: response.Appointment.Status,
          staffId: response.Appointment.Staff?.Id,
          staffName: response.Appointment.Staff?.Name || '',
          sessionTypeId: response.Appointment.SessionType?.Id,
          sessionTypeName: response.Appointment.SessionType?.Name || '',
          locationId: response.Appointment.Location?.Id,
          locationName: response.Appointment.Location?.Name || '',
          startDateTime: response.Appointment.StartDateTime,
          endDateTime: response.Appointment.EndDateTime,
          duration: response.Appointment.Duration,
          staffRequested: response.Appointment.StaffRequested,
          firstAppointment: response.Appointment.FirstAppointment,
        },
        message: 'Appointment updated successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update appointment' };
    }
  }

  async getBookableItems(params: GetBookableItemsParams): Promise<ListResult<BookableItem>> {
    const defaultStart = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await this.client.get<any>('/appointment/bookableitems', {
      params: {
        SessionTypeIds: params.sessionTypeIds,
        LocationIds: params.locationIds,
        StaffIds: params.staffIds,
        StartDate: params.startDate || defaultStart,
        EndDate: params.endDate || defaultEnd,
        AppointmentId: params.appointmentId,
        Limit: 200,
      },
    });

    const items = response.BookableItems.map((item: any) => ({
      scheduledItemId: item.ScheduledItemId,
      staffId: item.StaffId || item.Staff?.Id,
      staffName: item.Staff?.Name || `${item.Staff?.FirstName || ''} ${item.Staff?.LastName || ''}`.trim(),
      sessionTypeId: item.SessionTypeId || item.SessionType?.Id,
      sessionTypeName: item.SessionType?.Name || '',
      locationId: item.LocationId || item.Location?.Id,
      locationName: item.Location?.Name || '',
      startDateTime: item.StartDateTime,
      endDateTime: item.EndDateTime,
      isAvailable: item.IsAvailable,
      isSingleSessionBookable: item.IsSingleSessionBookable,
    }));

    return { items, total: items.length };
  }

  async getScheduleItems(params?: { locationIds?: number[]; staffIds?: number[]; startDate?: string; endDate?: string; ignorePrepFinishBuffer?: boolean }): Promise<ListResult<ScheduleItem>> {
    const defaultStart = new Date().toISOString().split('T')[0];
    const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await this.client.get<any>('/appointment/scheduleitems', {
      params: {
        LocationIds: params?.locationIds,
        StaffIds: params?.staffIds,
        StartDate: params?.startDate || defaultStart,
        EndDate: params?.endDate || defaultEnd,
        IgnorePrepFinishBuffer: params?.ignorePrepFinishBuffer,
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

    return { items: scheduleItems, total: scheduleItems.length };
  }

  async getActiveSessionTimes(params?: { scheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment'; sessionTypeIds?: number[]; startTime?: string; endTime?: string; days?: string[] }): Promise<ListResult<ActiveSessionTime>> {
    const response = await this.client.get<any>('/appointment/activesessiontimes', {
      params: {
        ScheduleType: params?.scheduleType || 'All',
        SessionTypeIds: params?.sessionTypeIds,
        StartTime: params?.startTime,
        EndTime: params?.endTime,
        Days: params?.days,
      },
    });

    const activeTimes = response.ActiveSessionTimes.map((time: any) => {
      const result: ActiveSessionTime = {
        id: time.Id,
        sessionTypeId: time.SessionTypeId || time.SessionType?.Id,
        sessionTypeName: time.SessionType?.Name || '',
        scheduleType: time.ScheduleType,
      };

      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
        const dayData = time[day];
        if (dayData) {
          (result as any)[day.toLowerCase()] = {
            startTime: dayData.StartTime,
            endTime: dayData.EndTime,
            bookable: dayData.Bookable,
          };
        }
      });

      return result;
    });

    return { items: activeTimes, total: activeTimes.length };
  }

  // ==========================================================================
  // ENROLLMENT MANAGEMENT
  // ==========================================================================

  async getEnrollments(params?: GetEnrollmentsParams): Promise<ListResult<Enrollment>> {
    const response = await this.client.get<any>('/enrollment/enrollments', {
      params: {
        LocationIds: params?.locationIds,
        ClassScheduleIds: params?.classScheduleIds,
        StaffIds: params?.staffIds,
        ProgramIds: params?.programIds,
        SessionTypeIds: params?.sessionTypeIds,
        SemesterIds: params?.semesterIds,
        CourseIds: params?.courseIds,
        StartDate: params?.startDate,
        EndDate: params?.endDate,
        Limit: params?.limit || 200,
      },
    });

    const enrollments = response.Enrollments.map((e: any) => ({
      id: e.Id,
      locationId: e.Location?.Id,
      locationName: e.Location?.Name || '',
      name: e.Name,
      description: e.Description,
      staffId: e.Staff?.Id,
      staffName: e.Staff?.Name,
      programId: e.Program?.Id,
      programName: e.Program?.Name,
      scheduleType: e.ScheduleType,
      startDate: e.StartDate,
      endDate: e.EndDate,
      startTime: e.StartTime,
      endTime: e.EndTime,
      dayOfWeek: e.DayOfWeek,
      maxCapacity: e.MaxCapacity,
      webCapacity: e.WebCapacity,
      isAvailable: e.IsAvailable ?? true,
    }));

    return { items: enrollments, total: enrollments.length };
  }

  async addClientToEnrollment(params: AddClientToEnrollmentParams): Promise<OperationResult> {
    try {
      await this.client.post<any>('/enrollment/addclienttoenrollment', {
        ClientId: params.clientId,
        ClassScheduleId: params.classScheduleId,
        EnrollDateForward: params.enrollFromDate,
        EnrollOpen: params.enrollUntilDate,
        Waitlist: params.waitlist,
        SendEmail: params.sendEmail,
      });
      return { success: true, message: 'Client added to enrollment successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to add client to enrollment' };
    }
  }

  async getClientEnrollments(clientId: string): Promise<ListResult<Enrollment>> {
    const response = await this.client.get<any>('/client/clientenrollments', {
      params: { ClientId: clientId },
    });

    const enrollments = response.Enrollments?.map((e: any) => ({
      id: e.Id,
      locationId: e.Location?.Id,
      locationName: e.Location?.Name || '',
      name: e.Name,
      description: e.Description,
      staffId: e.Staff?.Id,
      staffName: e.Staff?.Name,
      startDate: e.StartDate,
      endDate: e.EndDate,
      isAvailable: true,
    })) || [];

    return { items: enrollments, total: enrollments.length };
  }

  // ==========================================================================
  // SALES & COMMERCE
  // ==========================================================================

  async getServices(params?: GetServicesParams): Promise<ListResult<Service>> {
    const response = await this.client.get<any>('/sale/services', {
      params: {
        ProgramIds: params?.programIds,
        SessionTypeIds: params?.sessionTypeIds,
        LocationId: params?.locationId,
        ClassId: params?.classId,
        HideRelatedPrograms: params?.hideRelatedPrograms,
        Limit: params?.limit || 200,
      },
    });

    const services = response.Services.map((s: any) => ({
      id: s.Id,
      name: s.Name,
      price: s.Price,
      onlinePrice: s.OnlinePrice,
      taxIncluded: s.TaxIncluded,
      taxRate: s.TaxRate,
      programId: s.ProgramId,
      sessionTypeId: s.SessionTypeId,
      count: s.Count,
      expirationUnit: s.ExpirationUnit,
      expirationLength: s.ExpirationLength,
      membershipId: s.MembershipId,
      priority: s.Priority,
      prerequisite: s.Prerequisite,
    }));

    return { items: services, total: services.length };
  }

  async getPackages(locationId?: number, classScheduleId?: number): Promise<ListResult<Package>> {
    const response = await this.client.get<any>('/sale/packages', {
      params: {
        LocationId: locationId,
        ClassScheduleId: classScheduleId,
        Limit: 200,
      },
    });

    const packages = response.Packages.map((p: any) => ({
      id: p.Id,
      name: p.Name,
      classCount: p.Count,
      price: p.Price,
      onlinePrice: p.OnlinePrice,
      taxIncluded: p.TaxIncluded,
      active: p.Active,
      productId: p.ProductId,
      sellOnline: p.SellOnline,
      services: p.Services?.map((s: any) => ({ id: s.Id, name: s.Name, count: s.Count })),
    }));

    return { items: packages, total: packages.length };
  }

  async getProducts(params?: GetProductsParams): Promise<ListResult<Product>> {
    const response = await this.client.get<any>('/sale/products', {
      params: {
        ProductIds: params?.productIds,
        SearchText: params?.searchText,
        CategoryIds: params?.categoryIds,
        SubCategoryIds: params?.subCategoryIds,
        SellOnline: params?.sellOnline,
        Limit: params?.limit || 200,
      },
    });

    const products = response.Products.map((p: any) => ({
      id: p.Id,
      name: p.Name,
      price: p.Price,
      onlinePrice: p.OnlinePrice,
      description: p.Description,
      category: p.Category,
      subCategory: p.Subcategory,
      color: p.Color?.Name,
      size: p.Size?.Name,
      taxIncluded: p.TaxIncluded,
      taxRate: p.TaxRate,
      sellOnline: p.SellOnline,
    }));

    return { items: products, total: response.PaginationResponse?.TotalResults || products.length };
  }

  async getContracts(params?: GetContractsParams): Promise<ListResult<Contract>> {
    const response = await this.client.get<any>('/sale/contracts', {
      params: {
        ContractIds: params?.contractIds,
        SoldOnline: params?.soldOnline,
        LocationId: params?.locationId,
        Limit: 200,
      },
    });

    const contracts = response.Contracts.map((c: any) => ({
      id: c.Id,
      name: c.Name,
      description: c.Description,
      assignsMembershipId: c.AssignsMembershipId,
      assignsMembershipName: c.AssignsMembershipName,
      soldOnline: c.SoldOnline,
      contractType: c.ContractType,
      agreementTerms: c.AgreementTerms,
      autopaySchedule: c.AutopaySchedule ? {
        frequency: c.AutopaySchedule.FrequencyType,
        duration: c.AutopaySchedule.FrequencyValue,
        paymentAmount: c.AutopaySchedule.PaymentAmount,
      } : undefined,
      introOffer: c.IntroOffer ? {
        id: c.IntroOffer.Id,
        name: c.IntroOffer.Name,
        price: c.IntroOffer.Price,
      } : undefined,
      locationId: c.LocationId,
    }));

    return { items: contracts, total: contracts.length };
  }

  async checkoutShoppingCart(params: CheckoutParams): Promise<OperationResult<{ shoppingCart?: ShoppingCartResult; appointments?: Array<{ id: number; status: string; startDateTime: string; endDateTime: string }> }>> {
    try {
      const cartItems = params.items.map(item => {
        const baseItem: any = { Quantity: item.quantity };

        if (item.item.type === 'Tip') {
          baseItem.Item = { Type: 'Tip', Metadata: { Amount: item.item.metadata.amount } };
        } else {
          baseItem.Item = { Type: item.item.type, Metadata: { Id: item.item.metadata.id } };
        }

        if (item.appointmentBookingRequests) {
          baseItem.AppointmentBookingRequests = item.appointmentBookingRequests.map(apt => ({
            StaffId: apt.staffId,
            LocationId: apt.locationId,
            SessionTypeId: apt.sessionTypeId,
            StartDateTime: apt.startDateTime,
            Notes: apt.notes,
          }));
        }

        return baseItem;
      });

      const paymentMethods = params.payments.map(payment => {
        const basePayment: any = { Type: payment.type, Metadata: { Amount: payment.metadata.amount } };
        if (payment.metadata.notes) basePayment.Metadata.Notes = payment.metadata.notes;
        if (payment.type === 'StoredCard' && payment.metadata.lastFour) basePayment.Metadata.LastFour = payment.metadata.lastFour;
        if (payment.type === 'CreditCard') {
          if (payment.metadata.cardholderName) basePayment.Metadata.CardholderName = payment.metadata.cardholderName;
          if (payment.metadata.billingAddress) {
            basePayment.Metadata.BillingAddress = payment.metadata.billingAddress;
            basePayment.Metadata.BillingCity = payment.metadata.billingCity;
            basePayment.Metadata.BillingState = payment.metadata.billingState;
            basePayment.Metadata.BillingPostalCode = payment.metadata.billingPostalCode;
          }
        }
        return basePayment;
      });

      const response = await this.client.post<any>('/sale/checkoutshoppingcart', {
        ClientId: params.clientId,
        Items: cartItems,
        Payments: paymentMethods,
        InStore: params.inStore,
        PromotionCode: params.promotionCode,
        SendEmail: params.sendEmail,
        LocationId: params.locationId,
      });

      return {
        success: true,
        data: {
          shoppingCart: response.ShoppingCart ? {
            id: response.ShoppingCart.Id,
            subTotal: response.ShoppingCart.SubTotal,
            taxTotal: response.ShoppingCart.TaxTotal,
            discountTotal: response.ShoppingCart.DiscountTotal,
            grandTotal: response.ShoppingCart.GrandTotal,
            items: response.ShoppingCart.CartItems.map((item: any) => ({
              id: item.Id,
              name: item.Name,
              price: item.UnitPrice,
              quantity: item.Quantity,
              discountAmount: item.DiscountAmount,
              tax: item.TaxAmount,
              total: item.Total,
            })),
          } : undefined,
          appointments: response.Appointments?.map((apt: any) => ({
            id: apt.Id,
            status: apt.Status,
            startDateTime: apt.StartDateTime,
            endDateTime: apt.EndDateTime,
          })),
        },
        message: 'Checkout completed successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to checkout' };
    }
  }

  async purchaseContract(params: PurchaseContractParams): Promise<OperationResult<{ clientContract: { id: number; clientId: string; contractName: string; startDate: string; endDate?: string; paymentAmount: number } }>> {
    try {
      const response = await this.client.post<any>('/sale/purchasecontract', {
        ClientId: params.clientId,
        ContractId: params.contractId,
        StartDate: params.startDate,
        FirstPaymentOccurs: params.firstPaymentOccurs || 'StartDate',
        ClientSignature: params.clientSignature,
        PromotionCode: params.promotionCode,
        LocationId: params.locationId,
      });

      return {
        success: true,
        data: {
          clientContract: {
            id: response.ClientContract.Id,
            clientId: response.ClientContract.ClientId,
            contractName: response.ClientContract.ContractName,
            startDate: response.ClientContract.StartDate,
            endDate: response.ClientContract.EndDate,
            paymentAmount: response.ClientContract.PaymentAmount,
          },
        },
        message: 'Contract purchased successfully',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to purchase contract' };
    }
  }
}

// Create singleton instance
let serviceInstance: MindbodyService | null = null;

export function getMindbodyService(): MindbodyService {
  if (!serviceInstance) {
    serviceInstance = new MindbodyService();
  }
  return serviceInstance;
}

export function resetMindbodyService(): void {
  serviceInstance = null;
}
