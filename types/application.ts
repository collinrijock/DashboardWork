export interface Address {
  addressLine1: any;
  addressLine2: any;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Applicant {
  email: string;
  phone: string;
  lastName: string;
  firstName: string;
}

export interface Application {
  statusHistory: Array<any>;
  applicationDocuments: Array<{
    name: string;
    url: string;
  }>;
  id: string;
  externalApplicationId: string;
  applicationData: {
    dot: any;
    ein: string | null;
    applicant: Applicant | null;
    fleetSize: number | null;
    businessName: string | null;
    businessAddress: Address | null;
    salesforceId: string | null;
  };
  insuranceProgramName: string | null;
  insuranceProgramSchemaVersion: number | null;
  createdBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  status: string | null;
  tenantId: string | null;
  source: string | null;
}

export enum ApplicationStatus {
  New = "New",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected",
  Pending = "Pending",
  Cancelled = "Cancelled",
  Issued = "Issued"
}
