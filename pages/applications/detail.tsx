import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import axios from "axios";
import { Application } from "@/types/application";

const ApplicationDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useFirebaseAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [documentDescription, setDocumentDescription] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState<String>("");
  const terminalStatuses = ["APPROVED", "REJECTED", "CANCELLED"];

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${id}?token=${token}`);
      const data = await response.json();
      setApplication(data);
      setApplicationStatus(data.status);
    } catch (error: any) {
      console.error("Error fetching application:", error.message);
    }
    setLoading(false);
  };

  async function updateApplicationStatus(newStatus: string) {
    try {
      const data = {
        id,
        status: newStatus,
        statusNote: statusNote
      };
      const response = await axios.post(`/api/applications/${id}/status`, data, {
        headers: {
          "x-firebase-auth": token || ""
        },
      });

      if (response.status === 200) {
        fetchApplication();
      } else {
        throw new Error(`Failed to update application status to ${newStatus}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Update application status when applicationStatus changes
  const handleStatusChange = async (newStatus: string) => {
    setApplicationStatus(newStatus)
    if (!terminalStatuses.includes(newStatus)) {
      updateApplicationStatus(newStatus);
    }
  }

  useEffect(() => {
    if (token && id) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const handleFileChange = async (e: any) => {
    if (e.target.files.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearDocumentUploadFields = () => {
    setSelectedFile(null);
    setDocumentType("");
    setDocumentName(null);
    setDocumentDescription(null);
  };

  const handleUpload = async () => {
    if (selectedFile && documentDescription && documentName && documentType.length > 0) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);
      formData.append("documentName", documentName);
      formData.append("documentDescription", documentDescription);
      formData.append("applicationId", id as string);

      try {
        await axios.post(`/api/applications/${id}/documents/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-firebase-auth": token || ""
          },
        });
        fetchApplication();
        clearDocumentUploadFields();
      } catch (err: any) {
        console.error(err.message);
        alert("Error uploading document, please use a supported file type.");
      }
    } else {
      alert("Please fill out all fields");
    }
  };

  const renderApplicationDetails = () => {
    if (loading || !id || !application?.applicationData) {
      return <div></div>;
    } else {
      return (
        <div className="flex flex-col">
          <div className="flex md:flex-row mt-4" >
            {/* Business Information */}
            <div className="w-2/3 bg-primary p-4 rounded">
              <h3 className="mb-4">Business Information</h3>
              {/* Business Fields Here */}
              <div className="flex flex-row justify-between flex-wrap">
                <div>
                  <label className="text-xs">First Name</label>
                  <p>{application.applicationData?.applicant?.firstName || "Missing"}</p>
                </div>
                <div>
                  <label className="text-xs">Last Name</label>
                  <p>{application.applicationData?.applicant?.lastName || "Missing"}</p>
                </div>
                <div>
                  <label className="text-xs">Phone</label>
                  <p>{application.applicationData?.applicant?.phone || "Missing"}</p>
                </div>
                <div>
                  <label className="text-xs">Business Name</label>
                  <p>{application.applicationData.businessName || "Missing"}</p>
                </div>
              </div>
              <div className="flex flex-row mt-4">
                <div>
                  <label className="text-xs">Email</label>
                  <p>{application.applicationData?.applicant?.email || "Missing"}</p>
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
                {!terminalStatuses.includes(application.status as string) && <select
                  value={applicationStatus}
                  onChange={(e: any) => handleStatusChange(e.target.value)}
                  className="p-2 border w-2/3 border-gray-300 rounded text-primary bg-primary"
                >
                  <option value="NEW">New</option>
                  <option value="UNDERREVIEW">UnderReview</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>}
                {terminalStatuses.includes(application.status as string) &&
                  <p className="text-primary">{application.status}</p>
                }

              </div>
              <div className={`transition-opacity w-full duration-300 ease-in-out ${terminalStatuses.includes(applicationStatus) ? 'opacity-100' : 'opacity-0'}`}>
                {terminalStatuses.includes(applicationStatus) && !terminalStatuses.includes(String(application.status)) &&
                  <div>
                    <textarea
                      value={statusNote as string}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Status Notes"
                      className="w-full text-primary bg-primary border border-gray-300 rounded"
                    />
                    <button
                      className="bg-secondary w-full text-primary rounded p-2 mt-4"
                      onClick={() => { if (statusNote.length > 0) updateApplicationStatus(applicationStatus) }}
                    >
                      Submit
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-primary py-4 mt-4 rounded">
            <h3 className="text-md mb-4 ml-4">Documents</h3>
            {application.applicationDocuments && application.applicationDocuments.length > 0 ? (
              <div className="flex flex-col justify-around">
                {application.applicationDocuments.map((document: any, index) => (
                  <div key={index} className="flex flex-row items-center justify-end p-4 border-t border-primary-dimmed ">
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
              </div>
            ) : (
              <div className="ml-4" >No documents found.</div>
            )}

          </div>

          <div className="flex flex-col w-full">
            <h3 className="text-md p-4">Upload a Document</h3>
            <div className="flex flex-row w-full">
              <div className="flex flex-row items-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="border border-primary rounded ml-4"
                />
              </div>
              <div className={`transition-opacity w-full duration-300 ease-in-out ${selectedFile ? 'opacity-100' : 'opacity-0'}`}>
                {selectedFile && <div className="flex flex-row w-full justify-around">
                  <select
                    className="w-full ml-4 box-border border-none bg-primary placeholder:text-primary-dimmed"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="">Document Type</option>
                    <option value="rental_agreement">Rental Agreement</option>
                    <option value="loss_runs">Loss Runs</option>
                    <option value="coverage_agreement">Coverage Agreement</option>

                  </select>
                  <input
                    type="text"
                    placeholder="Document Name"
                    value={documentName as string}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="w-full ml-4 box-border border-none bg-primary placeholder:text-primary-dimmed"
                  />
                  <input
                    type="text"
                    placeholder="Document Description"
                    value={documentDescription as string}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    className="w-full ml-4 box-border border-none bg-primary placeholder:text-primary-dimmed"
                  />
                  <button
                    className="bg-primary text-primary rounded p-2 ml-4"
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                </div>}
              </div>
            </div>
          </div>

          {/* Vehicles */}
          <div className="w-full bg-primary py-4 my-4 rounded relative">
            <input
              className="absolute right-4 top-4 border border-primary rounded p-1"
              type="search"
              placeholder="Search Vehicles..."
            />
            <h3 className="mb-4 ml-4">Vehicles</h3>
            {/* Vehicles Here */}
          </div>
        </div>);
    }
  };

  return (
    <div className="bg-secondary min-h-screen">
      <Head>
        <title>Applicant Details</title>
      </Head>
      <button
        onClick={() => router.back()}
        className="bg-primary hover:bg-primary-hover p-2 m-4 rounded"
      >
        Back
      </button>
      <div className="px-12 pt-12">
        <h1 className="w-full text-6xl p-2">Applicant Details</h1>
        <div className={`transition-opacity duration-300 ease-in-out ${application ? 'opacity-100' : 'opacity-0'}`}>
          {renderApplicationDetails()}
        </div>
      </div>
    </div>
  );

};

export default ApplicationDetail;
