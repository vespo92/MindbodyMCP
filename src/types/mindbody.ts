// Mindbody API Types

export interface PaginationResponse {
  PaginationResponse: {
    RequestedLimit: number;
    RequestedOffset: number;
    PageSize: number;
    TotalResults: number;
  };
}

export interface Staff {
  Id: number;
  FirstName: string;
  LastName: string;
  Name: string;
  Email?: string;
  MobilePhone?: string;
  ImageUrl?: string;
  Bio?: string;
  isMale?: boolean;
}

export interface Location {
  Id: number;
  Name: string;
  Description?: string;
  Address?: string;
  Address2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
}

export interface ClassDescription {
  Id: number;
  Name: string;
  Description?: string;
  ImageUrl?: string;
}

export interface Class {
  Id: number;
  ClassScheduleId: number;
  Location: Location;
  ClassDescription: ClassDescription;
  Staff: Staff;
  StartDateTime: string;
  EndDateTime: string;
  IsCanceled: boolean;
  IsWaitlistAvailable: boolean;
  IsAvailable: boolean;
  IsSubstitute: boolean;
  MaxCapacity: number;
  TotalBooked: number;
  WebCapacity: number;
  TotalBookedWaitlist: number;
}

export interface GetClassesRequest {
  ClassDescriptionIds?: number[];
  ClassIds?: number[];
  StaffIds?: number[];
  StartDateTime?: string;
  EndDateTime?: string;
  LocationIds?: number[];
  Limit?: number;
  Offset?: number;
}

export interface GetClassesResponse extends PaginationResponse {
  Classes: Class[];
}

export interface GetStaffRequest {
  StaffIds?: number[];
  Filters?: string[];
  SessionTypeIds?: number[];
  LocationIds?: number[];
  StartDateTime?: string;
  Limit?: number;
  Offset?: number;
}

export interface GetStaffResponse extends PaginationResponse {
  StaffMembers: Staff[];
}

// Helper types for our tools
export interface TeacherSchedule {
  teacher: {
    id: number;
    name: string;
    email?: string;
  };
  dateRange: {
    start: string;
    end: string;
  };
  totalClasses: number;
  classes: Array<{
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    location: string;
    isSubstitute: boolean;
    isCanceled: boolean;
    spotsAvailable: number;
    totalSpots: number;
  }>;
  summary: {
    byDay: Record<string, number>;
    byLocation: Record<string, number>;
    byClassType: Record<string, number>;
  };
}

// Additional request/response types
export interface AddClientToClassRequest {
  ClientId: string;
  ClassId: number;
  RequirePayment?: boolean;
  Waitlist?: boolean;
}

export interface RemoveClientFromClassRequest {
  ClientId: string;
  ClassId: number;
  LateCancel?: boolean;
}

export interface GetClientsRequest {
  SearchText?: string;
  ClientIds?: string[];
  LastModifiedDate?: string;
  IsProspect?: boolean;
  Limit?: number;
  Offset?: number;
}

export interface GetServicesRequest {
  ProgramIds?: number[];
  SessionTypeIds?: number[];
  LocationId?: number;
  ClassId?: number;
  HideRelatedPrograms?: boolean;
  Limit?: number;
}

export interface GetPackagesRequest {
  LocationId?: number;
  ClassScheduleId?: number;
  Limit?: number;
}

export interface GetProductsRequest {
  ProductIds?: number[];
  SearchText?: string;
  CategoryIds?: string[];
  SubCategoryIds?: string[];
  SellOnline?: boolean;
  Limit?: number;
}

export interface GetLocationsRequest {
  Limit?: number;
}

export interface GetProgramsRequest {
  ScheduleType?: 'All' | 'Class' | 'Enrollment' | 'Appointment';
  OnlineOnly?: boolean;
  Limit?: number;
}

export interface GetSessionTypesRequest {
  ProgramIds?: number[];
  OnlineOnly?: boolean;
  Limit?: number;
}

export interface GetAppointmentsRequest {
  StaffIds: number[];
  LocationIds?: number[];
  StartDate?: string;
  EndDate?: string;
  AppointmentIds?: number[];
  ClientIds?: string[];
  Limit?: number;
}

export interface GetEnrollmentsRequest {
  LocationIds?: number[];
  ClassScheduleIds?: number[];
  StaffIds?: number[];
  ProgramIds?: number[];
  SessionTypeIds?: number[];
  SemesterIds?: number[];
  CourseIds?: number[];
  StartDate?: string;
  EndDate?: string;
  Limit?: number;
}
