import { mindbodyClient, type IMindbodyClient } from '../api/client';
import { classCache, SimpleCache } from '../cache/index';

// Get site information
export async function getSitesTool(
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  site: {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    pageColor1?: string;
    pageColor2?: string;
    pageColor3?: string;
    pageColor4?: string;
    acceptsVisa: boolean;
    acceptsMasterCard: boolean;
    acceptsDiscover: boolean;
    acceptsAmex: boolean;
    contactEmail?: string;
    esi?: string;
    taxInclusivePrices: boolean;
    currency: string;
    countryCode: string;
    timeZone?: string;
    totalLocations: number;
  };
}> {
  const cacheKey = 'site-info';
  let cached = cache.get<any>(cacheKey);

  if (!cached) {
    cached = await client.get<any>('/site/sites', {
      params: { Limit: 1 },
    });
    cache.set(cacheKey, cached, 60); // Cache for 60 minutes
  }

  const site = cached.Sites[0];
  return {
    site: {
      id: site.Id,
      name: site.Name,
      description: site.Description,
      logoUrl: site.LogoUrl,
      pageColor1: site.PageColor1,
      pageColor2: site.PageColor2,
      pageColor3: site.PageColor3,
      pageColor4: site.PageColor4,
      acceptsVisa: site.AcceptsVisa,
      acceptsMasterCard: site.AcceptsMasterCard,
      acceptsDiscover: site.AcceptsDiscover,
      acceptsAmex: site.AcceptsAmericanExpress,
      contactEmail: site.ContactEmail,
      esi: site.ESI,
      taxInclusivePrices: site.TaxInclusivePrices,
      currency: site.Currency,
      countryCode: site.CountryCode,
      timeZone: site.TimeZone,
      totalLocations: site.TotalLocations,
    },
  };
}

// Get locations (studio locations)
export async function getLocationsTool(
  client: IMindbodyClient = mindbodyClient,
  cache: SimpleCache = classCache
): Promise<{
  locations: Array<{
    id: number;
    name: string;
    description?: string;
    hasClasses: boolean;
    phoneExtension?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    facilities?: Array<{
      id: number;
      name: string;
    }>;
    amenities?: Array<{
      id: number;
      name: string;
    }>;
    businessHours?: Array<{
      day: string;
      startTime?: string;
      endTime?: string;
      isClosed: boolean;
    }>;
  }>;
  totalLocations: number;
}> {
  const cacheKey = 'locations';
  let cached = cache.get<any>(cacheKey);

  if (!cached) {
    cached = await client.get<any>('/site/locations', {
      params: { Limit: 100 },
    });
    cache.set(cacheKey, cached, 60); // Cache for 60 minutes
  }

  const locations = cached.Locations.map((location: any) => ({
    id: location.Id,
    name: location.Name,
    description: location.Description,
    hasClasses: location.HasClasses,
    phoneExtension: location.PhoneExtension,
    address: location.Address,
    address2: location.Address2,
    city: location.City,
    state: location.StateProvCode,
    postalCode: location.PostalCode,
    latitude: location.Latitude,
    longitude: location.Longitude,
    phone: location.Phone,
    facilities: location.AdditionalImageURLs?.map((f: any) => ({
      id: f.Id,
      name: f.Name,
    })),
    amenities: location.Amenities?.map((a: any) => ({
      id: a.Id,
      name: a.Name,
    })),
    businessHours: location.BusinessHours ? Object.keys(location.BusinessHours).map(day => ({
      day,
      startTime: location.BusinessHours[day].StartTime,
      endTime: location.BusinessHours[day].EndTime,
      isClosed: location.BusinessHours[day].IsClosed,
    })) : undefined,
  }));

  return {
    locations,
    totalLocations: locations.length,
  };
}

// Get programs (yoga, pilates, etc.)
export async function getProgramsTool(
  scheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment',
  onlineOnly: boolean = false,
  client: IMindbodyClient = mindbodyClient
): Promise<{
  programs: Array<{
    id: number;
    name: string;
    scheduleType: string;
    cancelOffset?: number;
    contentFormats?: string[];
  }>;
  totalPrograms: number;
}> {
  const response = await client.get<any>('/site/programs', {
    params: {
      ScheduleType: scheduleType || 'All',
      OnlineOnly: onlineOnly,
      Limit: 200,
    },
  });

  const programs = response.Programs.map((program: any) => ({
    id: program.Id,
    name: program.Name,
    scheduleType: program.ScheduleType,
    cancelOffset: program.CancelOffset,
    contentFormats: program.ContentFormats,
  }));

  return {
    programs,
    totalPrograms: programs.length,
  };
}

// Get resources (rooms, equipment, etc.)
export async function getResourcesTool(
  sessionTypeIds?: number[],
  locationId?: number,
  startDateTime?: string,
  endDateTime?: string,
  client: IMindbodyClient = mindbodyClient
): Promise<{
  resources: Array<{
    id: number;
    name: string;
  }>;
  totalResources: number;
}> {
  const response = await client.get<any>('/site/resources', {
    params: {
      SessionTypeIds: sessionTypeIds,
      LocationId: locationId,
      StartDateTime: startDateTime,
      EndDateTime: endDateTime,
    },
  });

  const resources = response.Resources.map((resource: any) => ({
    id: resource.Id,
    name: resource.Name,
  }));

  return {
    resources,
    totalResources: resources.length,
  };
}

// Get session types (class types, appointment types)
export async function getSessionTypesTool(
  programIds?: number[],
  onlineOnly: boolean = false,
  client: IMindbodyClient = mindbodyClient
): Promise<{
  sessionTypes: Array<{
    id: number;
    name: string;
    defaultDuration?: number;
    defaultDurationType?: string;
    numDeducted?: number;
    programId: number;
    category?: string;
    categoryId?: number;
    subcategory?: string;
    subcategoryId?: number;
    type: string;
  }>;
  totalSessionTypes: number;
}> {
  const response = await client.get<any>('/site/sessiontypes', {
    params: {
      ProgramIds: programIds,
      OnlineOnly: onlineOnly,
      Limit: 200,
    },
  });

  const sessionTypes = response.SessionTypes.map((session: any) => ({
    id: session.Id,
    name: session.Name,
    defaultDuration: session.DefaultTimeLength,
    defaultDurationType: session.DefaultTimeLengthType,
    numDeducted: session.NumDeducted,
    programId: session.ProgramId,
    category: session.Category,
    categoryId: session.CategoryId,
    subcategory: session.Subcategory,
    subcategoryId: session.SubcategoryId,
    type: session.Type,
  }));

  return {
    sessionTypes,
    totalSessionTypes: sessionTypes.length,
  };
}

// Get staff (all staff members)
export async function getStaffTool(
  staffIds?: number[],
  filters?: string[],
  sessionTypeIds?: number[],
  locationIds?: number[],
  startDateTime?: string,
  client: IMindbodyClient = mindbodyClient
): Promise<{
  staff: Array<{
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    email?: string;
    mobilePhone?: string;
    homePhone?: string;
    workPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    imageUrl?: string;
    bio?: string;
    isMale?: boolean;
    appointmentInstructor?: boolean;
    alwaysAllowDoubleBooking?: boolean;
    independentContractor?: boolean;
    employmentStart?: string;
    employmentEnd?: string;
  }>;
  totalStaff: number;
}> {
  const response = await client.get<any>('/staff/staff', {
    params: {
      StaffIds: staffIds,
      Filters: filters,
      SessionTypeIds: sessionTypeIds,
      LocationIds: locationIds,
      StartDateTime: startDateTime,
      Limit: 200,
    },
  });

  const staff = response.StaffMembers.map((member: any) => ({
    id: member.Id,
    firstName: member.FirstName,
    lastName: member.LastName,
    name: member.Name,
    email: member.Email,
    mobilePhone: member.MobilePhone,
    homePhone: member.HomePhone,
    workPhone: member.WorkPhone,
    address: member.Address,
    city: member.City,
    state: member.State,
    postalCode: member.PostalCode,
    country: member.Country,
    imageUrl: member.ImageUrl,
    bio: member.Bio,
    isMale: member.isMale,
    appointmentInstructor: member.AppointmentInstructor,
    alwaysAllowDoubleBooking: member.AlwaysAllowDoubleBooking,
    independentContractor: member.IndependentContractor,
    employmentStart: member.EmploymentStart,
    employmentEnd: member.EmploymentEnd,
  }));

  return {
    staff,
    totalStaff: response.PaginationResponse.TotalResults,
  };
}

// Get activation code (for site activation)
export async function getActivationCodeTool(
  client: IMindbodyClient = mindbodyClient
): Promise<{
  activationCode: string;
  activationLink: string;
}> {
  const response = await client.get<any>('/site/activationcode');

  return {
    activationCode: response.ActivationCode,
    activationLink: response.ActivationLink,
  };
}