#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all tools
import { getTeacherScheduleTool } from './tools/teacherSchedule';
import {
  getClassesTool,
  getClassDescriptionsTool,
  addClientToClassTool,
  removeClientFromClassTool,
  getWaitlistEntriesTool,
  substituteClassTeacherTool,
  getClassSchedulesTool,
} from './tools/classManagement';
import {
  getClientsTool,
  addClientTool,
  updateClientTool,
  getClientVisitsTool,
  getClientMembershipsTool,
  addClientArrivalTool,
  getClientAccountBalancesTool,
  getClientContractsTool,
} from './tools/clientManagement';
import {
  getServicesTool,
  getPackagesTool,
  getProductsTool,
  checkoutShoppingCartTool,
  purchaseContractTool,
  getContractsTool,
} from './tools/salesManagement';
import {
  getSitesTool,
  getLocationsTool,
  getProgramsTool,
  getResourcesTool,
  getSessionTypesTool,
  getStaffTool,
  getActivationCodeTool,
} from './tools/siteManagement';
import {
  getStaffAppointmentsTool,
  addAppointmentTool,
  updateAppointmentTool,
  getBookableItemsTool,
  getActiveSessionTimesTool,
  getScheduleItemsTool,
} from './tools/appointmentManagement';
import {
  getEnrollmentsTool,
  addClientToEnrollmentTool,
  getClientEnrollmentsTool,
} from './tools/enrollmentManagement';

// Validate required environment variables
const requiredEnvVars = [
  'MINDBODY_API_KEY',
  'MINDBODY_SITE_ID',
  'MINDBODY_SOURCE_NAME',
  'MINDBODY_SOURCE_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    console.error('Please copy .env.example to .env and fill in your credentials');
    process.exit(1);
  }
}

// Create MCP server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'mindbody-mcp',
    version: process.env.MCP_SERVER_VERSION || '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Teacher/Staff Tools
      {
        name: 'getTeacherSchedule',
        description: 'Get a teacher\'s class schedule for a specified date range',
        inputSchema: {
          type: 'object',
          properties: {
            teacherName: { type: 'string', description: 'The name of the teacher' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
          },
          required: ['teacherName'],
        },
      },
      {
        name: 'getStaff',
        description: 'Get all staff members with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Specific staff IDs to retrieve' },
            filters: { type: 'array', items: { type: 'string' }, description: 'Filters to apply' },
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            startDateTime: { type: 'string', description: 'Start date/time in ISO format' },
          },
        },
      },
      
      // Class Management Tools
      {
        name: 'getClasses',
        description: 'Get all classes with filtering options',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs to filter by' },
            classDescriptionIds: { type: 'array', items: { type: 'number' }, description: 'Class description IDs' },
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs to filter by' },
          },
        },
      },
      {
        name: 'getClassDescriptions',
        description: 'Get all class types/descriptions offered',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'getClassSchedules',
        description: 'Get class schedules (recurring class templates)',
        inputSchema: {
          type: 'object',
          properties: {
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            classDescriptionIds: { type: 'array', items: { type: 'number' }, description: 'Class description IDs' },
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs' },
            programIds: { type: 'array', items: { type: 'number' }, description: 'Program IDs' },
          },
        },
      },
      {
        name: 'addClientToClass',
        description: 'Book a client into a class',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            classId: { type: 'number', description: 'Class ID to book' },
            requirePayment: { type: 'boolean', description: 'Require payment (default true)' },
            waitlist: { type: 'boolean', description: 'Add to waitlist if full (default false)' },
          },
          required: ['clientId', 'classId'],
        },
      },
      {
        name: 'removeClientFromClass',
        description: 'Cancel a client\'s class booking',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            classId: { type: 'number', description: 'Class ID' },
            lateCancel: { type: 'boolean', description: 'Mark as late cancel (default false)' },
          },
          required: ['clientId', 'classId'],
        },
      },
      {
        name: 'getWaitlistEntries',
        description: 'Get waitlist entries for classes',
        inputSchema: {
          type: 'object',
          properties: {
            classScheduleIds: { type: 'array', items: { type: 'number' }, description: 'Class schedule IDs' },
            classIds: { type: 'array', items: { type: 'number' }, description: 'Class IDs' },
            clientIds: { type: 'array', items: { type: 'string' }, description: 'Client IDs' },
          },
        },
      },
      {
        name: 'substituteClassTeacher',
        description: 'Substitute a teacher for a class',
        inputSchema: {
          type: 'object',
          properties: {
            classId: { type: 'number', description: 'Class ID' },
            originalTeacherId: { type: 'number', description: 'Original teacher ID' },
            substituteTeacherId: { type: 'number', description: 'Substitute teacher ID' },
            substituteTeacherName: { type: 'string', description: 'Substitute teacher name (optional)' },
          },
          required: ['classId', 'originalTeacherId', 'substituteTeacherId'],
        },
      },
      
      // Client Management Tools
      {
        name: 'getClients',
        description: 'Search and retrieve clients',
        inputSchema: {
          type: 'object',
          properties: {
            searchText: { type: 'string', description: 'Search text for client name/email/phone' },
            clientIds: { type: 'array', items: { type: 'string' }, description: 'Specific client IDs' },
            lastModifiedDate: { type: 'string', description: 'Get clients modified after this date' },
            isProspect: { type: 'boolean', description: 'Filter for prospects only' },
          },
        },
      },
      {
        name: 'addClient',
        description: 'Add a new client',
        inputSchema: {
          type: 'object',
          properties: {
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            mobilePhone: { type: 'string', description: 'Mobile phone' },
            birthDate: { type: 'string', description: 'Birth date in YYYY-MM-DD format' },
            addressLine1: { type: 'string', description: 'Street address' },
            city: { type: 'string', description: 'City' },
            state: { type: 'string', description: 'State/Province' },
            postalCode: { type: 'string', description: 'Postal code' },
            country: { type: 'string', description: 'Country' },
            emergencyContactName: { type: 'string', description: 'Emergency contact name' },
            emergencyContactPhone: { type: 'string', description: 'Emergency contact phone' },
            emergencyContactRelationship: { type: 'string', description: 'Emergency contact relationship' },
            sendAccountEmails: { type: 'boolean', description: 'Send account emails (default true)' },
            referredBy: { type: 'string', description: 'Referral source' },
          },
          required: ['firstName', 'lastName'],
        },
      },
      {
        name: 'updateClient',
        description: 'Update client information',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID to update' },
            updates: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                mobilePhone: { type: 'string' },
                birthDate: { type: 'string' },
                addressLine1: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                emergencyContactName: { type: 'string' },
                emergencyContactPhone: { type: 'string' },
                sendAccountEmails: { type: 'boolean' },
              },
            },
          },
          required: ['clientId', 'updates'],
        },
      },
      {
        name: 'getClientVisits',
        description: 'Get client\'s visit/attendance history',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
          },
          required: ['clientId'],
        },
      },
      {
        name: 'getClientMemberships',
        description: 'Get client\'s active memberships',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            locationId: { type: 'number', description: 'Location ID (optional)' },
          },
          required: ['clientId'],
        },
      },
      {
        name: 'addClientArrival',
        description: 'Check in a client (mark arrival)',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            locationId: { type: 'number', description: 'Location ID' },
          },
          required: ['clientId', 'locationId'],
        },
      },
      {
        name: 'getClientAccountBalances',
        description: 'Get client\'s account balances',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
          },
          required: ['clientId'],
        },
      },
      {
        name: 'getClientContracts',
        description: 'Get client\'s contracts/memberships',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
          },
          required: ['clientId'],
        },
      },
      
      // Sales & Commerce Tools
      {
        name: 'getServices',
        description: 'Get available services (class packages, memberships)',
        inputSchema: {
          type: 'object',
          properties: {
            programIds: { type: 'array', items: { type: 'number' }, description: 'Program IDs' },
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            locationId: { type: 'number', description: 'Location ID' },
            classId: { type: 'number', description: 'Class ID' },
            hideRelatedPrograms: { type: 'boolean', description: 'Hide related programs' },
          },
        },
      },
      {
        name: 'getPackages',
        description: 'Get class packages',
        inputSchema: {
          type: 'object',
          properties: {
            locationId: { type: 'number', description: 'Location ID' },
            classScheduleId: { type: 'number', description: 'Class schedule ID' },
          },
        },
      },
      {
        name: 'getProducts',
        description: 'Get retail products',
        inputSchema: {
          type: 'object',
          properties: {
            productIds: { type: 'array', items: { type: 'number' }, description: 'Product IDs' },
            searchText: { type: 'string', description: 'Search text' },
            categoryIds: { type: 'array', items: { type: 'string' }, description: 'Category IDs' },
            subCategoryIds: { type: 'array', items: { type: 'string' }, description: 'Subcategory IDs' },
            sellOnline: { type: 'boolean', description: 'Filter for online products' },
          },
        },
      },
      {
        name: 'getContracts',
        description: 'Get available contracts/memberships',
        inputSchema: {
          type: 'object',
          properties: {
            contractIds: { type: 'array', items: { type: 'number' }, description: 'Contract IDs' },
            soldOnline: { type: 'boolean', description: 'Filter for online contracts' },
            locationId: { type: 'number', description: 'Location ID' },
          },
        },
      },
      {
        name: 'checkoutShoppingCart',
        description: 'Process a shopping cart checkout',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            items: {
              type: 'array',
              description: 'Cart items',
              items: {
                type: 'object',
                properties: {
                  item: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['Service', 'Product', 'Package', 'Tip'] },
                      metadata: { type: 'object' },
                    },
                  },
                  quantity: { type: 'number' },
                },
              },
            },
            payments: {
              type: 'array',
              description: 'Payment methods',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['Cash', 'Check', 'CreditCard', 'Comp', 'Custom', 'StoredCard'] },
                  metadata: { type: 'object' },
                },
              },
            },
            inStore: { type: 'boolean', description: 'In-store purchase' },
            promotionCode: { type: 'string', description: 'Promotion code' },
            sendEmail: { type: 'boolean', description: 'Send email receipt' },
            locationId: { type: 'number', description: 'Location ID' },
          },
          required: ['clientId', 'items', 'payments'],
        },
      },
      {
        name: 'purchaseContract',
        description: 'Purchase a contract/membership',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            contractId: { type: 'number', description: 'Contract ID' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            firstPaymentOccurs: { type: 'string', enum: ['StartDate', 'UponSale', 'BillingDate'] },
            clientSignature: { type: 'string', description: 'Client signature' },
            promotionCode: { type: 'string', description: 'Promotion code' },
            locationId: { type: 'number', description: 'Location ID' },
          },
          required: ['clientId', 'contractId', 'startDate'],
        },
      },
      
      // Site & Location Tools
      {
        name: 'getSites',
        description: 'Get site/business information',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'getLocations',
        description: 'Get all studio locations',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'getPrograms',
        description: 'Get programs (yoga, pilates, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            scheduleType: { type: 'string', enum: ['All', 'Class', 'Enrollment', 'Appointment'] },
            onlineOnly: { type: 'boolean', description: 'Online programs only' },
          },
        },
      },
      {
        name: 'getResources',
        description: 'Get resources (rooms, equipment)',
        inputSchema: {
          type: 'object',
          properties: {
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            locationId: { type: 'number', description: 'Location ID' },
            startDateTime: { type: 'string', description: 'Start date/time' },
            endDateTime: { type: 'string', description: 'End date/time' },
          },
        },
      },
      {
        name: 'getSessionTypes',
        description: 'Get session types (class types, appointment types)',
        inputSchema: {
          type: 'object',
          properties: {
            programIds: { type: 'array', items: { type: 'number' }, description: 'Program IDs' },
            onlineOnly: { type: 'boolean', description: 'Online sessions only' },
          },
        },
      },
      {
        name: 'getActivationCode',
        description: 'Get site activation code',
        inputSchema: { type: 'object', properties: {} },
      },
      
      // Appointment Tools
      {
        name: 'getStaffAppointments',
        description: 'Get staff appointments',
        inputSchema: {
          type: 'object',
          properties: {
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs' },
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
            appointmentIds: { type: 'array', items: { type: 'number' }, description: 'Appointment IDs' },
            clientIds: { type: 'array', items: { type: 'string' }, description: 'Client IDs' },
          },
          required: ['staffIds'],
        },
      },
      {
        name: 'addAppointment',
        description: 'Book an appointment',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            staffId: { type: 'number', description: 'Staff ID' },
            locationId: { type: 'number', description: 'Location ID' },
            sessionTypeId: { type: 'number', description: 'Session type ID' },
            startDateTime: { type: 'string', description: 'Start date/time in ISO format' },
            resourceIds: { type: 'array', items: { type: 'number' }, description: 'Resource IDs' },
            notes: { type: 'string', description: 'Appointment notes' },
            staffRequested: { type: 'boolean', description: 'Staff requested' },
            executePayment: { type: 'boolean', description: 'Execute payment' },
            sendEmail: { type: 'boolean', description: 'Send confirmation email' },
            applyPayment: { type: 'boolean', description: 'Apply payment' },
          },
          required: ['clientId', 'staffId', 'locationId', 'sessionTypeId', 'startDateTime'],
        },
      },
      {
        name: 'updateAppointment',
        description: 'Update an appointment',
        inputSchema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'number', description: 'Appointment ID' },
            staffId: { type: 'number', description: 'Staff ID' },
            startDateTime: { type: 'string', description: 'Start date/time' },
            endDateTime: { type: 'string', description: 'End date/time' },
            resourceIds: { type: 'array', items: { type: 'number' }, description: 'Resource IDs' },
            notes: { type: 'string', description: 'Notes' },
            executePayment: { type: 'boolean', description: 'Execute payment' },
            sendEmail: { type: 'boolean', description: 'Send email' },
            applyPayment: { type: 'boolean', description: 'Apply payment' },
          },
          required: ['appointmentId'],
        },
      },
      {
        name: 'getBookableItems',
        description: 'Get available appointment slots',
        inputSchema: {
          type: 'object',
          properties: {
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs' },
            startDate: { type: 'string', description: 'Start date' },
            endDate: { type: 'string', description: 'End date' },
            appointmentId: { type: 'number', description: 'Appointment ID for rescheduling' },
          },
          required: ['sessionTypeIds'],
        },
      },
      {
        name: 'getActiveSessionTimes',
        description: 'Get active session availability times',
        inputSchema: {
          type: 'object',
          properties: {
            scheduleType: { type: 'string', enum: ['All', 'Class', 'Enrollment', 'Appointment'] },
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            startTime: { type: 'string', description: 'Start time' },
            endTime: { type: 'string', description: 'End time' },
            days: { type: 'array', items: { type: 'string' }, description: 'Days of week' },
          },
        },
      },
      {
        name: 'getScheduleItems',
        description: 'Get schedule items/availability',
        inputSchema: {
          type: 'object',
          properties: {
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs' },
            startDate: { type: 'string', description: 'Start date' },
            endDate: { type: 'string', description: 'End date' },
            ignorePrepFinishBuffer: { type: 'boolean', description: 'Ignore prep/finish buffer' },
          },
        },
      },
      
      // Enrollment Tools
      {
        name: 'getEnrollments',
        description: 'Get enrollments (courses, workshops, series)',
        inputSchema: {
          type: 'object',
          properties: {
            locationIds: { type: 'array', items: { type: 'number' }, description: 'Location IDs' },
            classScheduleIds: { type: 'array', items: { type: 'number' }, description: 'Class schedule IDs' },
            staffIds: { type: 'array', items: { type: 'number' }, description: 'Staff IDs' },
            programIds: { type: 'array', items: { type: 'number' }, description: 'Program IDs' },
            sessionTypeIds: { type: 'array', items: { type: 'number' }, description: 'Session type IDs' },
            semesterIds: { type: 'array', items: { type: 'number' }, description: 'Semester IDs' },
            courseIds: { type: 'array', items: { type: 'number' }, description: 'Course IDs' },
            startDate: { type: 'string', description: 'Start date' },
            endDate: { type: 'string', description: 'End date' },
          },
        },
      },
      {
        name: 'addClientToEnrollment',
        description: 'Register client for course/workshop',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
            classScheduleIds: { type: 'array', items: { type: 'number' }, description: 'Class schedule IDs' },
            enrollmentDateForward: { type: 'string', description: 'Enrollment date forward' },
            enrollmentDates: { type: 'array', items: { type: 'string' }, description: 'Specific enrollment dates' },
            enroll: { type: 'boolean', description: 'Enroll (default true)' },
            waitlist: { type: 'boolean', description: 'Add to waitlist' },
            sendEmail: { type: 'boolean', description: 'Send confirmation email' },
            testMode: { type: 'boolean', description: 'Test mode' },
          },
          required: ['clientId', 'classScheduleIds'],
        },
      },
      {
        name: 'getClientEnrollments',
        description: 'Get client\'s enrollments',
        inputSchema: {
          type: 'object',
          properties: {
            clientId: { type: 'string', description: 'Client ID' },
          },
          required: ['clientId'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Teacher/Staff Tools
      case 'getTeacherSchedule':
        const teacherResult = await getTeacherScheduleTool(
          args.teacherName as string,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(teacherResult, null, 2) }] };
      
      case 'getStaff':
        const staffResult = await getStaffTool(
          args.staffIds as number[] | undefined,
          args.filters as string[] | undefined,
          args.sessionTypeIds as number[] | undefined,
          args.locationIds as number[] | undefined,
          args.startDateTime as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(staffResult, null, 2) }] };
      
      // Class Management Tools
      case 'getClasses':
        const classesResult = await getClassesTool(
          args.startDate as string | undefined,
          args.endDate as string | undefined,
          args.locationIds as number[] | undefined,
          args.classDescriptionIds as number[] | undefined,
          args.staffIds as number[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(classesResult, null, 2) }] };
      
      case 'getClassDescriptions':
        const descriptionsResult = await getClassDescriptionsTool();
        return { content: [{ type: 'text', text: JSON.stringify(descriptionsResult, null, 2) }] };
      
      case 'getClassSchedules':
        const schedulesResult = await getClassSchedulesTool(
          args.locationIds as number[] | undefined,
          args.classDescriptionIds as number[] | undefined,
          args.staffIds as number[] | undefined,
          args.programIds as number[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(schedulesResult, null, 2) }] };
      
      case 'addClientToClass':
        const addClassResult = await addClientToClassTool(
          args.clientId as string,
          args.classId as number,
          args.requirePayment as boolean | undefined,
          args.waitlist as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(addClassResult, null, 2) }] };
      
      case 'removeClientFromClass':
        const removeClassResult = await removeClientFromClassTool(
          args.clientId as string,
          args.classId as number,
          args.lateCancel as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(removeClassResult, null, 2) }] };
      
      case 'getWaitlistEntries':
        const waitlistResult = await getWaitlistEntriesTool(
          args.classScheduleIds as number[] | undefined,
          args.classIds as number[] | undefined,
          args.clientIds as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(waitlistResult, null, 2) }] };
      
      case 'substituteClassTeacher':
        const subResult = await substituteClassTeacherTool(
          args.classId as number,
          args.originalTeacherId as number,
          args.substituteTeacherId as number,
          args.substituteTeacherName as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(subResult, null, 2) }] };
      
      // Client Management Tools
      case 'getClients':
        const clientsResult = await getClientsTool(
          args.searchText as string | undefined,
          args.clientIds as string[] | undefined,
          args.lastModifiedDate as string | undefined,
          args.isProspect as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(clientsResult, null, 2) }] };
      
      case 'addClient':
        const addClientResult = await addClientTool(
          args.firstName as string,
          args.lastName as string,
          args.email as string | undefined,
          args.mobilePhone as string | undefined,
          args.birthDate as string | undefined,
          args.addressLine1 as string | undefined,
          args.city as string | undefined,
          args.state as string | undefined,
          args.postalCode as string | undefined,
          args.country as string | undefined,
          args.emergencyContactName as string | undefined,
          args.emergencyContactPhone as string | undefined,
          args.emergencyContactRelationship as string | undefined,
          args.sendAccountEmails as boolean | undefined,
          args.referredBy as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(addClientResult, null, 2) }] };
      
      case 'updateClient':
        const updateClientResult = await updateClientTool(
          args.clientId as string,
          args.updates as any
        );
        return { content: [{ type: 'text', text: JSON.stringify(updateClientResult, null, 2) }] };
      
      case 'getClientVisits':
        const visitsResult = await getClientVisitsTool(
          args.clientId as string,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(visitsResult, null, 2) }] };
      
      case 'getClientMemberships':
        const membershipsResult = await getClientMembershipsTool(
          args.clientId as string,
          args.locationId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(membershipsResult, null, 2) }] };
      
      case 'addClientArrival':
        const arrivalResult = await addClientArrivalTool(
          args.clientId as string,
          args.locationId as number
        );
        return { content: [{ type: 'text', text: JSON.stringify(arrivalResult, null, 2) }] };
      
      case 'getClientAccountBalances':
        const balancesResult = await getClientAccountBalancesTool(args.clientId as string);
        return { content: [{ type: 'text', text: JSON.stringify(balancesResult, null, 2) }] };
      
      case 'getClientContracts':
        const contractsResult = await getClientContractsTool(args.clientId as string);
        return { content: [{ type: 'text', text: JSON.stringify(contractsResult, null, 2) }] };
      
      // Sales & Commerce Tools
      case 'getServices':
        const servicesResult = await getServicesTool(
          args.programIds as number[] | undefined,
          args.sessionTypeIds as number[] | undefined,
          args.locationId as number | undefined,
          args.classId as number | undefined,
          args.hideRelatedPrograms as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(servicesResult, null, 2) }] };
      
      case 'getPackages':
        const packagesResult = await getPackagesTool(
          args.locationId as number | undefined,
          args.classScheduleId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(packagesResult, null, 2) }] };
      
      case 'getProducts':
        const productsResult = await getProductsTool(
          args.productIds as number[] | undefined,
          args.searchText as string | undefined,
          args.categoryIds as string[] | undefined,
          args.subCategoryIds as string[] | undefined,
          args.sellOnline as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(productsResult, null, 2) }] };
      
      case 'getContracts':
        const getContractsResult = await getContractsTool(
          args.contractIds as number[] | undefined,
          args.soldOnline as boolean | undefined,
          args.locationId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(getContractsResult, null, 2) }] };
      
      case 'checkoutShoppingCart':
        const checkoutResult = await checkoutShoppingCartTool(
          args.clientId as string,
          args.items as any,
          args.payments as any,
          args.inStore as boolean | undefined,
          args.promotionCode as string | undefined,
          args.sendEmail as boolean | undefined,
          args.locationId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(checkoutResult, null, 2) }] };
      
      case 'purchaseContract':
        const purchaseResult = await purchaseContractTool(
          args.clientId as string,
          args.contractId as number,
          args.startDate as string,
          args.firstPaymentOccurs as any,
          args.clientSignature as string | undefined,
          args.promotionCode as string | undefined,
          args.locationId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(purchaseResult, null, 2) }] };
      
      // Site & Location Tools
      case 'getSites':
        const sitesResult = await getSitesTool();
        return { content: [{ type: 'text', text: JSON.stringify(sitesResult, null, 2) }] };
      
      case 'getLocations':
        const locationsResult = await getLocationsTool();
        return { content: [{ type: 'text', text: JSON.stringify(locationsResult, null, 2) }] };
      
      case 'getPrograms':
        const programsResult = await getProgramsTool(
          args.scheduleType as any,
          args.onlineOnly as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(programsResult, null, 2) }] };
      
      case 'getResources':
        const resourcesResult = await getResourcesTool(
          args.sessionTypeIds as number[] | undefined,
          args.locationId as number | undefined,
          args.startDateTime as string | undefined,
          args.endDateTime as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(resourcesResult, null, 2) }] };
      
      case 'getSessionTypes':
        const sessionTypesResult = await getSessionTypesTool(
          args.programIds as number[] | undefined,
          args.onlineOnly as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(sessionTypesResult, null, 2) }] };
      
      case 'getActivationCode':
        const activationResult = await getActivationCodeTool();
        return { content: [{ type: 'text', text: JSON.stringify(activationResult, null, 2) }] };
      
      // Appointment Tools
      case 'getStaffAppointments':
        const appointmentsResult = await getStaffAppointmentsTool(
          args.staffIds as number[],
          args.locationIds as number[] | undefined,
          args.startDate as string | undefined,
          args.endDate as string | undefined,
          args.appointmentIds as number[] | undefined,
          args.clientIds as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(appointmentsResult, null, 2) }] };
      
      case 'addAppointment':
        const addAppointmentResult = await addAppointmentTool(
          args.clientId as string,
          args.staffId as number,
          args.locationId as number,
          args.sessionTypeId as number,
          args.startDateTime as string,
          args.resourceIds as number[] | undefined,
          args.notes as string | undefined,
          args.staffRequested as boolean | undefined,
          args.executePayment as boolean | undefined,
          args.sendEmail as boolean | undefined,
          args.applyPayment as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(addAppointmentResult, null, 2) }] };
      
      case 'updateAppointment':
        const updateAppointmentResult = await updateAppointmentTool(
          args.appointmentId as number,
          args.staffId as number | undefined,
          args.startDateTime as string | undefined,
          args.endDateTime as string | undefined,
          args.resourceIds as number[] | undefined,
          args.notes as string | undefined,
          args.executePayment as boolean | undefined,
          args.sendEmail as boolean | undefined,
          args.applyPayment as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(updateAppointmentResult, null, 2) }] };
      
      case 'getBookableItems':
        const bookableResult = await getBookableItemsTool(
          args.sessionTypeIds as number[],
          args.locationIds as number[] | undefined,
          args.staffIds as number[] | undefined,
          args.startDate as string | undefined,
          args.endDate as string | undefined,
          args.appointmentId as number | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(bookableResult, null, 2) }] };
      
      case 'getActiveSessionTimes':
        const activeTimesResult = await getActiveSessionTimesTool(
          args.scheduleType as any,
          args.sessionTypeIds as number[] | undefined,
          args.startTime as string | undefined,
          args.endTime as string | undefined,
          args.days as string[] | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(activeTimesResult, null, 2) }] };
      
      case 'getScheduleItems':
        const scheduleItemsResult = await getScheduleItemsTool(
          args.locationIds as number[] | undefined,
          args.staffIds as number[] | undefined,
          args.startDate as string | undefined,
          args.endDate as string | undefined,
          args.ignorePrepFinishBuffer as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(scheduleItemsResult, null, 2) }] };
      
      // Enrollment Tools
      case 'getEnrollments':
        const enrollmentsResult = await getEnrollmentsTool(
          args.locationIds as number[] | undefined,
          args.classScheduleIds as number[] | undefined,
          args.staffIds as number[] | undefined,
          args.programIds as number[] | undefined,
          args.sessionTypeIds as number[] | undefined,
          args.semesterIds as number[] | undefined,
          args.courseIds as number[] | undefined,
          args.startDate as string | undefined,
          args.endDate as string | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(enrollmentsResult, null, 2) }] };
      
      case 'addClientToEnrollment':
        const addEnrollmentResult = await addClientToEnrollmentTool(
          args.clientId as string,
          args.classScheduleIds as number[],
          args.enrollmentDateForward as string | undefined,
          args.enrollmentDates as string[] | undefined,
          args.enroll as boolean | undefined,
          args.waitlist as boolean | undefined,
          args.sendEmail as boolean | undefined,
          args.testMode as boolean | undefined
        );
        return { content: [{ type: 'text', text: JSON.stringify(addEnrollmentResult, null, 2) }] };
      
      case 'getClientEnrollments':
        const clientEnrollmentsResult = await getClientEnrollmentsTool(args.clientId as string);
        return { content: [{ type: 'text', text: JSON.stringify(clientEnrollmentsResult, null, 2) }] };
      
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Mindbody MCP Server v2.0 started - Complete yoga studio management');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});