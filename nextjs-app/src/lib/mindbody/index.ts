// ============================================================================
// MINDBODY MODULE - Public API
// ============================================================================

// Client & Service
export { MindbodyApiClient, getMindbodyClient, resetMindbodyClient } from './client';
export { MindbodyService, getMindbodyService, resetMindbodyService } from './service';

// Types - Core Entities
export type {
  Site,
  Location,
  Resource,
  Staff,
  Client,
  ClassDescription,
  Class,
  ClassSchedule,
  Appointment,
  Enrollment,
  Service,
  Package,
  Product,
  Contract,
  Program,
  SessionType,
} from './types';

// Types - Request Parameters
export type {
  GetStaffParams,
  GetClientsParams,
  AddClientParams,
  UpdateClientParams,
  GetClientVisitsParams,
  GetClassesParams,
  AddClientToClassParams,
  RemoveClientFromClassParams,
  SubstituteTeacherParams,
  GetAppointmentsParams,
  AddAppointmentParams,
  UpdateAppointmentParams,
  GetBookableItemsParams,
  GetEnrollmentsParams,
  AddClientToEnrollmentParams,
  GetServicesParams,
  GetProductsParams,
  GetContractsParams,
  CheckoutParams,
  PurchaseContractParams,
  GetProgramsParams,
  GetSessionTypesParams,
} from './types';

// Types - Response Types
export type {
  ClientVisit,
  ClientMembership,
  ClientContract,
  WaitlistEntry,
  BookableItem,
  ScheduleItem,
  ActiveSessionTime,
  ShoppingCartResult,
  CartItem,
  Payment,
  TeacherSchedule,
  OperationResult,
  ListResult,
  VisitSummary,
  ApiResponse,
  PaginationResponse,
} from './types';
