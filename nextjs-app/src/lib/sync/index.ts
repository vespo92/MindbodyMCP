import { PrismaClient } from '@prisma/client';
import { MindbodyService, getMindbodyService } from '@/lib/mindbody/service';

// ============================================================================
// DATA SYNC SERVICE - Synchronizes Mindbody API data with local database
// ============================================================================

export interface SyncOptions {
  fullSync?: boolean;
  entities?: SyncEntity[];
}

export type SyncEntity =
  | 'sites'
  | 'locations'
  | 'staff'
  | 'clients'
  | 'classDescriptions'
  | 'classes'
  | 'appointments'
  | 'enrollments'
  | 'services'
  | 'packages'
  | 'products'
  | 'contracts'
  | 'programs'
  | 'sessionTypes';

export interface SyncResult {
  entity: string;
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
  duration: number;
}

export class MindbodySyncService {
  private prisma: PrismaClient;
  private mindbody: MindbodyService;
  private siteId: number;

  constructor(prisma: PrismaClient, mindbody?: MindbodyService) {
    this.prisma = prisma;
    this.mindbody = mindbody || getMindbodyService();
    this.siteId = parseInt(process.env.MINDBODY_SITE_ID || '-99', 10);
  }

  // ==========================================================================
  // MAIN SYNC METHODS
  // ==========================================================================

  async syncAll(options?: SyncOptions): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const entities = options?.entities || [
      'sites',
      'locations',
      'programs',
      'sessionTypes',
      'staff',
      'clients',
      'classDescriptions',
      'classes',
      'services',
      'packages',
      'products',
      'contracts',
    ];

    for (const entity of entities) {
      try {
        const result = await this.syncEntity(entity);
        results.push(result);

        // Log sync state
        await this.prisma.syncState.upsert({
          where: { entityType: entity },
          create: {
            entityType: entity,
            lastSyncedAt: new Date(),
            lastSuccessfulSyncAt: new Date(),
            totalRecords: result.created + result.updated,
          },
          update: {
            lastSyncedAt: new Date(),
            lastSuccessfulSyncAt: new Date(),
            totalRecords: result.created + result.updated,
          },
        });
      } catch (error: any) {
        results.push({
          entity,
          created: 0,
          updated: 0,
          deleted: 0,
          errors: [error.message],
          duration: 0,
        });
      }
    }

    return results;
  }

  async syncEntity(entity: SyncEntity): Promise<SyncResult> {
    const startTime = Date.now();

    switch (entity) {
      case 'sites':
        return this.syncSites(startTime);
      case 'locations':
        return this.syncLocations(startTime);
      case 'programs':
        return this.syncPrograms(startTime);
      case 'sessionTypes':
        return this.syncSessionTypes(startTime);
      case 'staff':
        return this.syncStaff(startTime);
      case 'clients':
        return this.syncClients(startTime);
      case 'classDescriptions':
        return this.syncClassDescriptions(startTime);
      case 'classes':
        return this.syncClasses(startTime);
      case 'services':
        return this.syncServices(startTime);
      case 'packages':
        return this.syncPackages(startTime);
      case 'products':
        return this.syncProducts(startTime);
      case 'contracts':
        return this.syncContracts(startTime);
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
  }

  // ==========================================================================
  // INDIVIDUAL ENTITY SYNC METHODS
  // ==========================================================================

  private async syncSites(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'sites', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getSites();

      for (const site of items) {
        const existing = await this.prisma.site.findUnique({ where: { id: site.id } });

        if (existing) {
          await this.prisma.site.update({
            where: { id: site.id },
            data: {
              name: site.name,
              description: site.description,
              logoUrl: site.logoUrl,
              contactEmail: site.contactEmail,
              acceptsVisa: site.acceptsVisa,
              acceptsMastercard: site.acceptsMastercard,
              acceptsAmex: site.acceptsAmex,
              acceptsDiscover: site.acceptsDiscover,
              allowsDirectPay: site.allowsDirectPay,
              smsPackageEnabled: site.smsPackageEnabled,
              syncedAt: new Date(),
            },
          });
          result.updated++;
        } else {
          await this.prisma.site.create({
            data: {
              id: site.id,
              name: site.name,
              description: site.description,
              logoUrl: site.logoUrl,
              contactEmail: site.contactEmail,
              acceptsVisa: site.acceptsVisa,
              acceptsMastercard: site.acceptsMastercard,
              acceptsAmex: site.acceptsAmex,
              acceptsDiscover: site.acceptsDiscover,
              allowsDirectPay: site.allowsDirectPay,
              smsPackageEnabled: site.smsPackageEnabled,
              syncedAt: new Date(),
            },
          });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncLocations(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'locations', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getLocations();

      for (const location of items) {
        const existing = await this.prisma.location.findUnique({ where: { id: location.id } });

        const data = {
          siteId: this.siteId,
          name: location.name,
          description: location.description,
          address: location.address,
          address2: location.address2,
          city: location.city,
          state: location.state,
          postalCode: location.postalCode,
          country: location.country,
          phone: location.phone,
          latitude: location.latitude,
          longitude: location.longitude,
          hasClasses: location.hasClasses,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.location.update({ where: { id: location.id }, data });
          result.updated++;
        } else {
          await this.prisma.location.create({ data: { id: location.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncPrograms(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'programs', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getPrograms();

      for (const program of items) {
        const existing = await this.prisma.program.findUnique({ where: { id: program.id } });

        const data = {
          siteId: this.siteId,
          name: program.name,
          scheduleType: program.scheduleType,
          cancelOffset: program.cancelOffset,
          contentFormats: program.contentFormats || [],
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.program.update({ where: { id: program.id }, data });
          result.updated++;
        } else {
          await this.prisma.program.create({ data: { id: program.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncSessionTypes(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'sessionTypes', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getSessionTypes();

      for (const sessionType of items) {
        const existing = await this.prisma.sessionType.findUnique({ where: { id: sessionType.id } });

        const data = {
          siteId: this.siteId,
          programId: sessionType.programId,
          name: sessionType.name,
          type: sessionType.type,
          defaultTimeLength: sessionType.defaultTimeLength,
          numDeducted: sessionType.numDeducted,
          onlineDescription: sessionType.onlineDescription,
          category: sessionType.category,
          subcategory: sessionType.subcategory,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.sessionType.update({ where: { id: sessionType.id }, data });
          result.updated++;
        } else {
          await this.prisma.sessionType.create({ data: { id: sessionType.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncStaff(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'staff', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getStaff();

      for (const staff of items) {
        const existing = await this.prisma.staff.findUnique({ where: { id: staff.id } });

        const data = {
          siteId: this.siteId,
          firstName: staff.firstName,
          lastName: staff.lastName,
          name: staff.name,
          email: staff.email,
          mobilePhone: staff.mobilePhone,
          imageUrl: staff.imageUrl,
          bio: staff.bio,
          isMale: staff.isMale,
          appointmentTrn: staff.appointmentTrn ?? false,
          independentContractor: staff.independentContractor ?? false,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.staff.update({ where: { id: staff.id }, data });
          result.updated++;
        } else {
          await this.prisma.staff.create({ data: { id: staff.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncClients(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'clients', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getClients();

      for (const client of items) {
        const existing = await this.prisma.client.findUnique({ where: { id: client.id } });

        const data = {
          siteId: this.siteId,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          mobilePhone: client.mobilePhone,
          homePhone: client.homePhone,
          birthDate: client.birthDate ? new Date(client.birthDate) : null,
          addressLine1: client.addressLine1,
          addressLine2: client.addressLine2,
          city: client.city,
          state: client.state,
          postalCode: client.postalCode,
          country: client.country,
          gender: client.gender,
          isProspect: client.isProspect,
          isCompany: client.isCompany,
          status: client.status,
          active: client.active,
          sendAccountEmails: client.sendAccountEmails,
          referredBy: client.referredBy,
          photoUrl: client.photoUrl,
          notes: client.notes,
          emergencyContactName: client.emergencyContact?.name,
          emergencyContactPhone: client.emergencyContact?.phone,
          emergencyContactRelationship: client.emergencyContact?.relationship,
          liabilityReleased: client.liability?.isReleased ?? false,
          liabilityAgreementDate: client.liability?.agreedDate ? new Date(client.liability.agreedDate) : null,
          accountBalance: client.accountBalance,
          creationDate: client.creationDate ? new Date(client.creationDate) : null,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.client.update({ where: { id: client.id }, data });
          result.updated++;
        } else {
          await this.prisma.client.create({ data: { id: client.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncClassDescriptions(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'classDescriptions', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getClassDescriptions();

      for (const desc of items) {
        const existing = await this.prisma.classDescription.findUnique({ where: { id: desc.id } });

        const data = {
          siteId: this.siteId,
          name: desc.name,
          description: desc.description,
          imageUrl: desc.imageUrl,
          category: desc.category,
          subcategory: desc.subcategory,
          active: desc.active,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.classDescription.update({ where: { id: desc.id }, data });
          result.updated++;
        } else {
          await this.prisma.classDescription.create({ data: { id: desc.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncClasses(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'classes', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      // Sync classes for the next 30 days
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { items } = await this.mindbody.getClasses({
        startDateTime: startDate,
        endDateTime: endDate,
      });

      for (const cls of items) {
        const existing = await this.prisma.class.findUnique({ where: { id: cls.id } });

        const data = {
          classScheduleId: cls.classScheduleId,
          locationId: cls.location.id,
          classDescriptionId: cls.classDescription.id,
          staffId: cls.staff.id,
          startDateTime: new Date(cls.startDateTime),
          endDateTime: new Date(cls.endDateTime),
          isCanceled: cls.isCanceled,
          isWaitlistAvailable: cls.isWaitlistAvailable,
          isAvailable: cls.isAvailable,
          isSubstitute: cls.isSubstitute,
          maxCapacity: cls.maxCapacity,
          totalBooked: cls.totalBooked,
          webCapacity: cls.webCapacity,
          totalBookedWaitlist: cls.totalBookedWaitlist,
          virtualStreamLink: cls.virtualStreamLink,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.class.update({ where: { id: cls.id }, data });
          result.updated++;
        } else {
          await this.prisma.class.create({ data: { id: cls.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncServices(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'services', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getServices();

      for (const service of items) {
        const existing = await this.prisma.service.findUnique({ where: { id: service.id } });

        const data = {
          siteId: this.siteId,
          programId: service.programId,
          sessionTypeId: service.sessionTypeId,
          name: service.name,
          price: service.price,
          onlinePrice: service.onlinePrice,
          taxIncluded: service.taxIncluded,
          taxRate: service.taxRate,
          count: service.count,
          expirationUnit: service.expirationUnit,
          expirationLength: service.expirationLength,
          membershipId: service.membershipId,
          priority: service.priority,
          prerequisite: service.prerequisite,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.service.update({ where: { id: service.id }, data });
          result.updated++;
        } else {
          await this.prisma.service.create({ data: { id: service.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncPackages(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'packages', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getPackages();

      for (const pkg of items) {
        const existing = await this.prisma.package.findUnique({ where: { id: pkg.id } });

        const data = {
          siteId: this.siteId,
          name: pkg.name,
          classCount: pkg.classCount,
          price: pkg.price,
          onlinePrice: pkg.onlinePrice,
          taxIncluded: pkg.taxIncluded,
          active: pkg.active,
          productId: pkg.productId,
          sellOnline: pkg.sellOnline,
          services: pkg.services || null,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.package.update({ where: { id: pkg.id }, data });
          result.updated++;
        } else {
          await this.prisma.package.create({ data: { id: pkg.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncProducts(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'products', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getProducts();

      for (const product of items) {
        const existing = await this.prisma.product.findUnique({ where: { id: product.id } });

        const data = {
          siteId: this.siteId,
          name: product.name,
          price: product.price,
          onlinePrice: product.onlinePrice,
          description: product.description,
          category: product.category,
          subCategory: product.subCategory,
          color: product.color,
          size: product.size,
          taxIncluded: product.taxIncluded,
          taxRate: product.taxRate,
          sellOnline: product.sellOnline,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.product.update({ where: { id: product.id }, data });
          result.updated++;
        } else {
          await this.prisma.product.create({ data: { id: product.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncContracts(startTime: number): Promise<SyncResult> {
    const result: SyncResult = { entity: 'contracts', created: 0, updated: 0, deleted: 0, errors: [], duration: 0 };

    try {
      const { items } = await this.mindbody.getContracts();

      for (const contract of items) {
        const existing = await this.prisma.contract.findUnique({ where: { id: contract.id } });

        const data = {
          siteId: this.siteId,
          name: contract.name,
          description: contract.description,
          assignsMembershipId: contract.assignsMembershipId,
          assignsMembershipName: contract.assignsMembershipName,
          soldOnline: contract.soldOnline,
          contractType: contract.contractType,
          agreementTerms: contract.agreementTerms,
          autopayFrequency: contract.autopaySchedule?.frequency,
          autopayDuration: contract.autopaySchedule?.duration,
          autopayPaymentAmount: contract.autopaySchedule?.paymentAmount,
          introOfferId: contract.introOffer?.id,
          introOfferName: contract.introOffer?.name,
          introOfferPrice: contract.introOffer?.price,
          locationId: contract.locationId,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.prisma.contract.update({ where: { id: contract.id }, data });
          result.updated++;
        } else {
          await this.prisma.contract.create({ data: { id: contract.id, ...data } });
          result.created++;
        }
      }
    } catch (error: any) {
      result.errors.push(error.message);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  async getSyncStatus(): Promise<Array<{ entityType: string; lastSyncedAt: Date | null; totalRecords: number }>> {
    return this.prisma.syncState.findMany({
      select: {
        entityType: true,
        lastSyncedAt: true,
        totalRecords: true,
      },
    });
  }

  async clearAllData(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await this.prisma.purchasePayment.deleteMany();
    await this.prisma.purchaseItem.deleteMany();
    await this.prisma.purchase.deleteMany();
    await this.prisma.clientVisit.deleteMany();
    await this.prisma.clientMembership.deleteMany();
    await this.prisma.clientContract.deleteMany();
    await this.prisma.enrollmentBooking.deleteMany();
    await this.prisma.enrollment.deleteMany();
    await this.prisma.waitlistEntry.deleteMany();
    await this.prisma.classBooking.deleteMany();
    await this.prisma.class.deleteMany();
    await this.prisma.classSchedule.deleteMany();
    await this.prisma.classDescription.deleteMany();
    await this.prisma.appointmentResource.deleteMany();
    await this.prisma.appointment.deleteMany();
    await this.prisma.bookableItem.deleteMany();
    await this.prisma.activeSessionTime.deleteMany();
    await this.prisma.sessionType.deleteMany();
    await this.prisma.program.deleteMany();
    await this.prisma.resource.deleteMany();
    await this.prisma.product.deleteMany();
    await this.prisma.package.deleteMany();
    await this.prisma.service.deleteMany();
    await this.prisma.contract.deleteMany();
    await this.prisma.client.deleteMany();
    await this.prisma.staff.deleteMany();
    await this.prisma.location.deleteMany();
    await this.prisma.site.deleteMany();
    await this.prisma.syncLog.deleteMany();
    await this.prisma.syncState.deleteMany();
  }
}

// Singleton instance
let syncServiceInstance: MindbodySyncService | null = null;

export function getSyncService(prisma: PrismaClient): MindbodySyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new MindbodySyncService(prisma);
  }
  return syncServiceInstance;
}
