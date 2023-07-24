export interface Application {
    applicationDocuments: Array<{
      name: string;
      url: string;
    }>;
    id: string;
    externalApplicationId: string;
    applicationData: {
      ein: string;
      applicant: {
        email: string;
        phone: string;
        lastName: string;
        firstName: string;
      };
      fleetSize: number;
      businessName: string;
      businessAddress: {
        zip: string;
        city: string;
        state: string;
        country: string;
        addressLine1: string;
        addressLine2: string;
      };
      website?: string;
      insuranceProgram: {
        name: string;
        version: number;
      };
      mailingAddress?: {
        zip: string;
        city: string;
        state: string;
        country: string;
        addressLine1: string;
        addressLine2: string;
      };
    };
    insuranceProgramName: string;
    insuranceProgramSchemaVersion: number;
    createdBy: string;
    createdOn: string;
    updatedOn: string;
    status: ApplicationStatus;
    tenantId: string;
    source: string;
  }
  
  export enum ApplicationStatus {
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PENDING = 'pending',
    REVIEW = 'review'
  }
  