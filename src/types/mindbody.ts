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
