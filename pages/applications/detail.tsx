import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import axios from "axios";

interface Address {
  addressLine1: any;
  addressLine2: any;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Applicant {
  email: string;
  phone: string;
  lastName: string;
  firstName: string;
}

interface Application {
  applicationDocuments: Array<{
    name: string;
    url: string;
  }>;
  id: string;
  externalApplicationId: string;
  applicationData: {
    ein: string | null;
    applicant: Applicant | null;
    fleetSize: number | null;
    businessName: string | null;
    businessAddress: Address | null;
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

const ApplicationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useFirebaseAuth();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(
          `/api/application-details?id=${id}&token=${token}`
        );
        const data = await response.json();
        setApplication(data);
      } catch (error: any) {
        console.error("Error fetching application:", error.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchApplication();
    }
  }, [token, id]);

  if (!id || !application) {
    return (
      <div>
        <Head>
          <title>Not Found</title>
        </Head>
        <div className="bg-secondary">
          <button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primary-hover p-2 m-4 rounded"
          >
            Back
          </button>
          <div className="container mx-auto p-4">
            <h1 className="w-full text-6xl p-2">Applicant Details</h1>
            <p>Missing data</p>
          </div>
        </div>
      </div>
    );
  }
  async function updateApplicationStatus(applicationId: string,) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Status should be "approved" or "rejected".');
    }

    try {
      const response = await axios({
        method: 'post',
        url: `${process.env.NEXT_PUBLIC_LULA_API_URL}/embedded/v1/backoffice/statusupdate`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          id: applicationId,
          status: status,
        },
      });

      if (response.status === 200) {
        // Handle success (update UI, show notification, etc.)
      } else {
        throw new Error(`Failed to update application status to ${status}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-secondary">
      <Head>
        <title>Applicant Details</title>
      </Head>
      <button
        onClick={() => router.back()}
        className="bg-primary hover:bg-primary-hover p-2 m-4 rounded"
      >
        Back
      </button>
      <div className="container mx-auto p-4">
        <h1 className="w-full text-6xl p-2">Applicant Details</h1>
        {application ? (
          <div className="flex flex-col">
            <div className="flex md:flex-row mt-4" >
              {/* Business Information */}
              <div className="w-2/3 bg-primary p-4 rounded">
                <h3 className="mb-4">Business Information</h3>
                {/* Business Fields Here */}
                <div className="flex flex-row justify-between flex-wrap">
                  <div>
                    <label className="text-xs">First Name</label>
                    <p>{application.applicationData.applicant?.firstName || "Missing"}</p>
                  </div>
                  <div>
                    <label className="text-xs">Last Name</label>
                    <p>{application.applicationData.applicant?.lastName || "Missing"}</p>
                  </div>
                  <div>
                    <label className="text-xs">Phone</label>
                    <p>{application.applicationData.applicant?.phone || "Missing"}</p>
                  </div>
                  <div>
                    <label className="text-xs">Business Name</label>
                    <p>{application.applicationData.businessName || "Missing"}</p>
                  </div>
                </div>
                <div className="flex flex-row mt-4">
                  <div>
                    <label className="text-xs">Email</label>
                    <p>{application.applicationData.applicant?.email || "Missing"}</p>
                  </div>
                  <div className="ml-10">
                    <label className="text-xs">EIN</label>
                    <p>{application.applicationData.ein || "Missing"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs">Business Address</label>
                  <p>
                    {application.applicationData.businessAddress ?
                      `${application.applicationData?.businessAddress?.addressLine1}${application.applicationData.businessAddress?.addressLine2 ? ', ' + application.applicationData.businessAddress.addressLine2 : ''}, ${application.applicationData.businessAddress.city}, ${application.applicationData.businessAddress.state}, ${application.applicationData.businessAddress.zip}`
                      : "Missing"
                    }
                  </p>

                </div>
                <div className="mt-4 flex flex-row">
                  <div>
                    <label className="text-xs">Insurance Program</label>
                    <p>{application.insuranceProgramName ? `${application.insuranceProgramName.replace(/_/g, ' ')} v${application.insuranceProgramSchemaVersion}` : "Missing"}</p>
                  </div>
                  <div className="ml-4">
                    <label className="text-xs">Fleet Size</label>
                    <p>{application.applicationData.fleetSize || "Missing"}</p>
                  </div>
                </div>
              </div>

              {/* Application Statuses */}
              <div className="w-1/3 bg-primary p-4 rounded ml-2">
                <h3 className="mb-4">Application Statuses</h3>
                <div className="flex flex-row items-center justify-between mb-4">
                  <label className="text-sm mb-2">Status</label>
                  {/* <select
                    value={String(application.status)}
                    onChange={(e : any) => updateApplicationStatus(application.id, e.target.value)}
                    className="p-2 border w-2/3 border-gray-300 rounded"
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select> */}
                  <p>{application.status}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-primary py-4 mt-4 rounded">
              <h3 className="text-xl font-serif mb-4 ml-4">Documents</h3>
              {application.applicationDocuments && application.applicationDocuments.length > 0 ? (
                <ul className="flex flex-col justify-around">
                  {application.applicationDocuments.map((document: any, index) => (
                    <div key={index} className=" flex flex-row items-center justify-end p-4 border-t border-primary-dimmed">
                      <div className="flex flex-col mr-auto">
                        <div className="flex flex-row items-center">
                          <a
                            href={`https://storage.cloud.google.com${document.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary mr-1 hover:text-primary-hover underline capitalize"
                          >

                            {document?.documentType.replace(/_/g, ' ')}
                          </a>
                          <svg width="15" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.7187 2.2803C11.9094 1.44061 10.5906 1.44061 9.75312 2.2803L3.78031 8.25311C2.41625 9.64373 2.41625 11.8562 3.78031 13.2187C5.14375 14.5844 7.35625 14.5844 8.71875 13.2187L13.4687 8.46873C13.7625 8.17811 14.2375 8.17811 14.5031 8.46873C14.8219 8.76248 14.8219 9.23748 14.5031 9.50311L9.75312 14.2531C7.83125 16.2312 4.66875 16.2312 2.71968 14.2531C0.769871 12.3312 0.769871 9.16873 2.71968 7.21873L8.71875 1.21967C10.1156 -0.177797 12.3812 -0.177797 13.7531 1.21967C15.1781 2.61717 15.1781 4.88436 13.7531 6.25311L8.0375 12.0219C7.05 13.0094 5.425 12.9187 4.55312 11.8312C3.80875 10.9 3.88312 9.55623 4.725 8.71248L9.46875 3.96873C9.7625 3.67811 10.2375 3.67811 10.5031 3.96873C10.8219 4.26248 10.8219 4.73748 10.5031 5.00311L5.7875 9.77186C5.48437 10.075 5.45625 10.5594 5.725 10.8937C6.0375 11.2844 6.62187 11.3187 6.975 10.9625L12.7187 5.21873C13.5312 4.40936 13.5312 3.09186 12.7187 2.2803Z" fill="#949BAD" />
                          </svg>
                        </div>
                        <p className=" text-primary-dimmed" >Uploaded {new Date(document.createdOn).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-center mr-10">
                        <p>Document Name</p>
                        <p className="text-sm text-primary-dimmed" >{document.documentName}</p>
                      </div>
                      <div className="flex flex-col items-center mr-10">
                        <p>Description</p>
                        <p className="text-sm text-primary-dimmed" >{document.documentDescription}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p>Created By</p>
                        <p className="text-sm text-primary-dimmed" >{document.createdBy}</p>
                      </div>
                    </div>
                  ))}
                </ul>
              ) : (
                <div className="ml-4" >No documents found.</div>
              )}
            </div>

            {/* Vehicles */}
            <div className="w-full bg-primary py-4 mt-4 rounded relative">
              <input
                className="absolute right-4 top-4 border border-gray-300 rounded p-1"
                type="search"
                placeholder="Search Vehicles..."
              />
              <h3 className="mb-4 ml-4">Vehicles</h3>
              {/* Vehicles Here */}
            </div>
          </div>
        ) : (
          <div>Missing data</div>
        )}
      </div>
    </div>
  );


};

export default ApplicationDetail;
