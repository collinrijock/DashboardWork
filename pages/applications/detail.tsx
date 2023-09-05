import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import axios from "axios";
import { Application } from "@/types/application";
import { Icon } from "@lula-technologies-inc/lux";

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
  const [isDocumentsToggled, setIsDocumentsToggled] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>("");
  const [compositeAddress, setCompositeAddress] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const fetchApplication = async () => {
    try {
      // fetch application
      const response = await fetch(`/api/applications/${id}?token=${token}`);
      const data = await response.json();
      setApplication(data);
      setApplicationStatus(data.status);

      // fetch comments
      const commentData = await fetch(`/api/applications/${id}/comments?token=${token}`, { headers: { "x-firebase-auth": token || "" } });
      const commentJson = await commentData.json();
      setComments(commentJson);

      // fetch vehicles
      const vehicleData = await fetch(`/api/applications/${id}/assets?token=${token}`, { headers: { "x-firebase-auth": token || "" } });
      const vehicleJson = await vehicleData.json();
      setVehicles(vehicleJson);

      // set composite address
      if (data.applicationData.businessAddress) {
        const { addressLine1, addressLine2, city, state, zip } = data.applicationData.businessAddress;
        setCompositeAddress(`${addressLine1 || ''}${addressLine2 ? ', ' + addressLine2 : ''}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${zip ? ', ' + zip : ''}`)
      };
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
    setEditStatus(false);
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

  const toggleDocumentsSection = () => {
    setIsDocumentsToggled(!isDocumentsToggled);
  }

  const uploadComment = () => {
    if (comment.length > 0) {
      const data = {
        comment
      };
      axios.post(`/api/applications/${id}/comment?token=${token}`, data
      ).then(() => {
        fetchApplication();
        setComment("");
      }).catch((err) => {
        console.error(err);
      });
    }
  }
  async function updateField(field: string, value: any, isBusinessAddress: boolean = false) {
    if (!application) return;
    const updatedApplication = JSON.parse(JSON.stringify(application));
    if (isBusinessAddress) {
      if (!updatedApplication.applicationData.businessAddress) {
        updatedApplication.applicationData.businessAddress = {};
      }
      updatedApplication.applicationData.businessAddress[field] = value;
    } else {
      updatedApplication.applicationData[field] = value;
    }

    try {
      const response = await axios.put(`/api/applications/${id}/update?token=${token}`, {
        applicationData: updatedApplication.applicationData,
      });

      if (response.status === 200) {
        fetchApplication();
      }
    } catch (error: any) {
      console.error("Failed to update the field:", error.message);
    }
  }

  const renderApplicationDetails = () => {
    if (loading || !id || !application?.applicationData) {
      return <div></div>;
    } else {
      return (
        <div className="flex flex-col">
          <div className="flex md:flex-row mt-4" >
            <div className="w-3/4 bg-primary p-4 rounded shadow-md">
              <div className="flex flex-row justify-between w-full items-center">
                <h3 className="font-medium">Business Information</h3>
                <button className="bg-primary text-primary rounded p-2" onClick={() => setEditMode(!editMode)}>
                  <Icon
                    className="fa-regular cursor-pointer opacity-50"
                    icon="pen"
                  />
                </button>
              </div>
              {!editMode ?
                <div>
                  <div className="flex flex-row flex-wrap">
                    <div>
                      <label className="text-xs text-primary-dimmed">Business Name</label>
                      <a className="flex flex-row items-center" href={`${process.env.NEXT_PUBLIC_PADDOCKS_URL}/company/${id}`} target="_blank">
                        <p title="Go to the company page in paddocks" className="mr-1 underline cursor-pointer truncate">{String(application.applicationData.businessName).length > 1 ? application.applicationData.businessName : <span className="text-yellow-500">Missing</span>}</p>
                      </a>
                    </div>
                    <div className="ml-10">
                      <label className="text-xs text-primary-dimmed">EIN</label>
                      <p>{String(application.applicationData.ein).length > 1 ? application.applicationData.ein : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                    {application.applicationData.dot && <div className="ml-10">
                      <label className="text-xs text-primary-dimmed">DOT</label>
                      <p>{String(application.applicationData.dot).length > 1 ? application.applicationData.dot : <span className="text-yellow-500">Missing</span>}</p>
                    </div>}
                  </div>
                  <div className="flex flex-row mt-4">
                    <div>
                      <label className="text-xs text-primary-dimmed">First Name</label>
                      <p>{String(application.applicationData?.applicant?.firstName).length > 1 ? application.applicationData.applicant?.firstName : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                    <div className="ml-10">
                      <label className="text-xs text-primary-dimmed">Last Name</label>
                      <p>{String(application.applicationData?.applicant?.lastName).length > 1 ? application.applicationData.applicant?.lastName : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                    <div className="ml-10">
                      <label className="text-xs text-primary-dimmed">Email</label>
                      <p>{String(application.applicationData?.applicant?.email).length > 1 ? application.applicationData.applicant?.email : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                    <div className="ml-10">
                      <label className="text-xs text-primary-dimmed">Phone</label>
                      <p>{String(application.applicationData?.applicant?.phone).length > 1 ? application.applicationData.applicant?.phone : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-primary-dimmed">Business Address</label>
                    <p>
                      {application.applicationData.businessAddress ? compositeAddress : <span className="text-yellow-500">Missing</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-row">
                    <div>
                      <label className="text-xs text-primary-dimmed">Insurance Program</label>
                      <p>{application.insuranceProgramName ? `${application.insuranceProgramName.replace(/_/g, ' ')} v${application.insuranceProgramSchemaVersion}` : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                    <div className="ml-4">
                      <label className="text-xs text-primary-dimmed">Fleet Size</label>
                      <p>{String(application.applicationData.fleetSize).length > 0 ? application.applicationData.fleetSize : <span className="text-yellow-500">Missing</span>}</p>
                    </div>
                  </div>
                </div>
                :
                <div>
                  <div className="flex flex-row flex-wrap gap-y-4">
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Business Name</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={String(application.applicationData.businessName)}
                        onChange={(e) => updateField('businessName', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">EIN</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={String(application.applicationData.ein)}
                        onChange={(e) => updateField('ein', e.target.value)}
                      />
                    </div>
                    {application.applicationData.dot && <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">DOT</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.dot}
                        onChange={(e) => updateField('dot', e.target.value)}
                      />
                    </div>}
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">First Name</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData?.applicant?.firstName}
                        onChange={(e) => updateField('applicant.firstName', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Last Name</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData?.applicant?.lastName}
                        onChange={(e) => updateField('applicant.lastName', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Email</label>
                      <input
                        type="email"
                        className="bg-primary"
                        value={application.applicationData?.applicant?.email}
                        onChange={(e) => updateField('applicant.email', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Phone</label>
                      <input
                        type="tel"
                        className="bg-primary"
                        value={application.applicationData?.applicant?.phone}
                        onChange={(e) => updateField('applicant.phone', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Street</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.businessAddress?.addressLine1 || ''}
                        onChange={(e) => updateField('businessAddress.addressLine1', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Street</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.businessAddress?.addressLine2 || ''}
                        onChange={(e) => updateField('businessAddress.addressLine2', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">City</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.businessAddress?.city || ''}
                        onChange={(e) => updateField('businessAddress.city', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">State</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.businessAddress?.state || ''}
                        onChange={(e) => updateField('businessAddress.state', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col mr-4">
                      <label className="text-xs text-primary-dimmed">Zip Code</label>
                      <input
                        type="text"
                        className="bg-primary"
                        value={application.applicationData.businessAddress?.zip || ''}
                        onChange={(e) => updateField('businessAddress.zip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* Application Statuses */}
            <div className="w-1/4 bg-primary p-4 rounded ml-2 shadow-md">
              <div className="flex flex-row justify-between w-full items-center">
                <h3 className="font-medium">Application Statuses</h3>
                <button className="bg-primary text-primary rounded p-2" onClick={() => setEditStatus(!editStatus)}>
                  <Icon
                    className="fa-regular cursor-pointer opacity-50"
                    icon="pen"
                  />
                </button>
              </div>
              <div className="flex flex-row items-center justify-between my-4 border-primary-dimmed border-b">
                <p className="text-sm">Overall</p>
                {editStatus && !terminalStatuses.includes(applicationStatus) ? (
                  // In edit mode
                  <>
                    <select
                      value={applicationStatus}
                      onChange={(e: any) => handleStatusChange(e.target.value)}
                      className="p-2 border w-2/3 border-gray-300 rounded text-primary bg-primary"
                    >
                      <option value="NEW">New</option>
                      <option value="UNDERREVIEW">Under Review</option>
                      <option value="INCOMPLETE">Incomplete</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </>
                ) : (
                  // Not in edit mode
                  <div className="flex flex-row items-center">
                    <p className="text-primary">{applicationStatus}</p>
                    <Icon
                      className="fa-sharp cursor-pointer opacity-50 p-2"
                      icon="circle-question"
                      title="Terminal Statuses (APPROVED, REJECTED, CANCELLED) cannot be edited as they are final. They also REQUIRE a note to be submitted."
                    />
                  </div>
                )}
              </div>
              {terminalStatuses.includes(applicationStatus) && !terminalStatuses.includes(String(application.status)) &&
                <div className="mt-2">
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
                  <button
                    className="bg-red-500 w-full text-white rounded mt-2 p-2"
                    onClick={() => { setApplicationStatus(String(application.status)); setStatusNote(""); setEditStatus(false) }}
                  >
                    Cancel
                  </button>
                </div>
              }
            </div>
          </div>

          {/* Documents */}
          <div className="bg-primary mt-8 rounded shadow-md">
            <div className="flex flex-row items-center justify-between p-4 border-b border-primary-dimmed">
              <h3 className="text-md font-medium">Documents</h3>
              {application.applicationDocuments.length > 0 &&
                <button onClick={toggleDocumentsSection} className={`transition-transform duration-300 ${isDocumentsToggled ? 'rotate-90' : 'rotate-0'}`}>
                  <Icon
                    icon="circle-chevron-down cursor-pointer"
                    className="fa-solid"
                  />
                </button>}
            </div>
            <div className={`transition-opacity w-full duration-300 ease-in-out ${!isDocumentsToggled && application.applicationDocuments.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
              {!isDocumentsToggled && application.applicationDocuments && application.applicationDocuments.length > 0 && (
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
              )}
            </div>
            {application.applicationDocuments.length === 0 && <div className="flex flex-row items-center justify-between p-4 ">
              <p className="">No documents uploaded yet</p>
            </div>
            }
            <div className="flex flex-col w-full p-4">
              <h3 className="text-md py-4 font-medium">Upload a Document</h3>
              <div className="flex flex-row w-full">
                <div className="flex flex-row items-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="border border-primary rounded"
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
          </div>

          {/* Vehicles */}
          <div className="bg-primary mt-8 pt-4 rounded shadow-md w-full">
            <div className="px-4">
              <h3 className="font-medium">Vehicles</h3>
            </div>
            <div className="flex flex-col mt-4">
              {vehicles.map((vehicle: any, index) => (
                <div key={index} className="grid grid-rows-1 grid-cols-12 gap-x-8 p-4 border-t border-primary-dimmed">

                  <div className="flex flex-col col-span-3 h-full">
                    <p className="text-primary-dimmed text-sm">Vin</p>
                    <p className="text-primary mt-2">{vehicle.content.vin || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-primary-dimmed text-sm">Mileage</p>
                    <p className="text-primary mt-2">{vehicle.content.mileage || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <p className="text-primary-dimmed text-sm">Registration State</p>
                    <p className="text-primary mt-2">{vehicle.content.registrationState || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <p className="text-primary-dimmed text-sm">License Plate</p>
                    <p className="text-primary mt-2">{vehicle.content.licensePlate || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <p className="text-primary-dimmed text-sm">Nickname</p>
                    <p className="text-primary mt-2">{vehicle.content.nickName || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <a href={`/vehicles/detail?vin=${vehicle.content.vin}`} target="_blank">
                      <button className="text-white bg-blue-500 hover:bg-blue-700 p-2 rounded">
                        Underwriting Report
                      </button>
                    </a>
                  </div>

                </div>
              ))}
              {vehicles.length === 0 && <div className="flex flex-row items-center justify-between p-4 border-t border-primary-dimmed">
                <p className="text-primary">No vehicles added yet</p>
              </div>
              }


            </div>
          </div>

          {/* Commments */}
          <div className="bg-primary my-8 rounded shadow-md">
            <div className="flex flex-row items-center justify-between p-4">
              <h3 className="text-md font-medium">Comments</h3>
            </div>
            <div className="flex flex-col justify-around">
              {comments?.length > 0 ? (
                <div className="flex flex-col justify-around">
                  {comments.map((comment: any, index) => (
                    <div key={index} className="flex flex-row items-center justify-end p-4 border-t border-primary-dimmed ">
                      <div className="flex flex-col mr-auto">
                        <p className="text-primary">{comment.comment}</p>
                        <p className="text-primary-dimmed" >{comment.createdBy}</p>
                      </div>
                      <p className="text-primary-dimmed">{new Date(comment.createdOn).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-row items-center justify-start p-4 border-t border-primary-dimmed ">
                  <p className="text-primary">No comments yet</p>
                </div>)}
            </div>
            {/* Comment Box */}
            <div className="p-4">
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:border-primary bg-primary text-primary"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <button className="mt-2 bg-secondary py-1 px-4 rounded hover:bg-primary-hover"
                onClick={uploadComment}
              >
                Submit Comment
              </button>
            </div>

          </div>

        </div >);
    }
  };

  return (
    <div className="bg-secondary min-h-screen">
      <Head>
        <title>Applicant Details</title>
      </Head>
      <div className="px-12">
        <button
          onClick={() => router.back()}
          className="hover:bg-primary-hover p-2 mt-2 rounded font-semibold"
        >
          &#60; Back
        </button>
        <h1 className="w-full text-6xl p-2">Applicant Details</h1>
        <div className={`transition-opacity duration-300 ease-in-out ${!loading && id && application?.applicationData ? 'opacity-100' : 'opacity-0'}`}>
          {renderApplicationDetails()}
        </div>
      </div>
    </div>
  );

};

export default ApplicationDetail;
