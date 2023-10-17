import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { Application } from "@/types/application";
import { Icon } from "@lula-technologies-inc/lux";
import { useAuthContext } from "@/hooks/auth";
import { useLaunchDarkly } from "@/hooks/useLaunchDarkly";

const ApplicationDetail = () => {
  const router = useRouter();
  const { isAuthenticated, getToken, user } = useAuthContext();
  const { getFlag, initialized } = useLaunchDarkly({ key: user?.sub!, email: user?.email! });
  const { id } = router.query;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [documentDescription, setDocumentDescription] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState<String>("");
  const [isDocumentsToggled, setIsDocumentsToggled] = useState<boolean>(false);
  const [isVehiclesToggled, setIsVehiclesToggled] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [comment, setComment] = useState<string>("");
  const [compositeAddress, setCompositeAddress] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [editPrivilege, setEditPrivilege] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'changelog'>('comments');


  const terminalStatuses = ["APPROVED", "REJECTED", "CANCELLED"];

  const fetchApplication = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setApplication(data);
      setApplicationStatus(data.status);
      const commentData = await fetch(`/api/applications/${id}/comments`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const commentJson = await commentData.json();
      setComments(commentJson);

      // fetch vehicles
      const vehicleData = await fetch(`/api/applications/${id}/assets`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
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
      const token = await getToken();
      if (!token) return;

      const data = {
        id,
        status: newStatus,
        statusNote: statusNote
      };
      const response = await axios.post(`/api/applications/${id}/status`, data, {
        headers: {
          "Authorization": `Bearer ${token}`
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

  useEffect(() => {
    if (initialized) {
      setEditPrivilege(getFlag('applications-dashboard-editing-privileges'));
    }
  }, [initialized, getFlag]);

  // Update application status when applicationStatus changes
  const handleStatusChange = async (newStatus: string) => {
    setApplicationStatus(newStatus)
    setEditStatus(false);
  }

  const handleVehicleStatusChange = async (vehicleId: string, status: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          accountId: application?.id,
          status,
        }),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchApplication();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  }

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

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
        const token = await getToken();
        await axios.post(`/api/applications/${id}/documents/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
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
  const toggleVehiclesSection = () => {
    setIsVehiclesToggled(!isVehiclesToggled);
  }
  const uploadComment = async () => {
    if (comment.length <= 0) return;
    try {
      const data = {
        comment
      };
      const token = await getToken();
      await axios.post(`/api/applications/${id}/comment`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchApplication();
      setComment("");
    } catch (err) {
      console.error(err);
    }
  }
  async function updateField(fieldPath: string[], value: string) {
    if (!application) return;
    const token = await getToken();
    if (!token) return;

    const updatedApplicationData = { ...application.applicationData };

    let target: any = updatedApplicationData;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (typeof target[fieldPath[i]] !== 'object') {
        target[fieldPath[i]] = {};
      }
      target = target[fieldPath[i]];
    }

    target[fieldPath[fieldPath.length - 1]] = value;

    setApplication({
      ...application,
      applicationData: updatedApplicationData,
    });
  }

  async function updateApplication() {
    const token = await getToken();
    if (!application || !token) return;
    try {
      await axios.put(`/api/applications/${id}/update`, {
        applicationData: application.applicationData,
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const response = await fetch(`/api/applications/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setApplication(data);
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
            <div className="w-3/4 flex flex-col">

              {/* Business Info */}
              <div className="w-full bg-primary p-4 rounded shadow-md">
                <div className="flex flex-row justify-between w-full items-center">
                  <h3 className="font-bold pb-2">Business Information</h3>
                  {!terminalStatuses.includes(applicationStatus) && editPrivilege && <button className="bg-primary text-primary rounded p-2" onClick={() => setEditMode(!editMode)}>
                    <Icon
                      className="fa-regular cursor-pointer opacity-50"
                      icon="pen"
                    />
                  </button>}
                </div>
                {!editMode ?
                  <div>
                    <div className="flex flex-row flex-wrap">
                      <div>
                        <label className="text-xs text-primary-dimmed">Business Name</label>
                        <a className="flex flex-row items-center" href={`${process.env.NEXT_PUBLIC_PADDOCKS_URL}/company/${id}`} target="_blank">
                          <p title="Go to the company page in paddocks" className="pr-2 capitalize font-medium underline cursor-pointer truncate">{String(application.applicationData.businessName).length > 1 ? application.applicationData.businessName : <span className="text-yellow-500">Missing</span>}</p>
                          <Icon
                            className="fa-regular cursor-pointer opacity-50"
                            icon="external-link"
                          />
                        </a>
                      </div>

                      <div className="ml-10">
                        <label className="text-xs text-primary-dimmed">Salesforce Opportunity</label>
                        <div >{(application.applicationData.salesforceId) ?
                          <a href={`https://lula.lightning.force.com/lightning/r/Account/${application.applicationData.salesforceId}/view`} target="_blank" className="flex flex-row items-center justify-between">
                            <p className="pr-2 font-medium underline">{application.applicationData.salesforceId}</p>
                            <Icon
                              className="fa-regular cursor-pointer opacity-50"
                              icon="external-link"
                            />
                          </a>
                          : <span className="text-yellow-500">Missing</span>}</div>
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
                        <label className="text-xws text-primary-dimmed">Phone</label>
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
                          onChange={(e) => updateField(['businessName'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">EIN</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={String(application.applicationData.ein)}
                          onChange={(e) => updateField(['ein'], e.target.value)}
                        />
                      </div>
                      {application.applicationData.dot && <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">DOT</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.dot}
                          onChange={(e) => updateField(['dot'], e.target.value)}
                        />
                      </div>}
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">First Name</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData?.applicant?.firstName}
                          onChange={(e) => updateField(['applicant', 'firstName'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Last Name</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData?.applicant?.lastName}
                          onChange={(e) => updateField(['applicant', 'lastName'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Email</label>
                        <input
                          type="email"
                          className="bg-primary"
                          value={application.applicationData?.applicant?.email}
                          onChange={(e) => updateField(['applicant', 'email'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Phone</label>
                        <input
                          type="tel"
                          className="bg-primary"
                          value={application.applicationData?.applicant?.phone}
                          onChange={(e) => updateField(['applicant', 'phone'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Street</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.businessAddress?.addressLine1 || ''}
                          onChange={(e) => updateField(['businessAddress', 'addressLine1'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Street</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.businessAddress?.addressLine2 || ''}
                          onChange={(e) => updateField(['businessAddress', 'addressLine2'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed, true">City</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.businessAddress?.city || ''}
                          onChange={(e) => updateField(['businessAddress', 'city'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">State</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.businessAddress?.state || ''}
                          onChange={(e) => updateField(['businessAddress', 'state'], e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col mr-4">
                        <label className="text-xs text-primary-dimmed">Zip Code</label>
                        <input
                          type="text"
                          className="bg-primary"
                          value={application.applicationData.businessAddress?.zip || ''}
                          onChange={(e) => updateField(['businessAddress', 'zip'], e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        className="bg-secondary w-full text-primary rounded p-2 mt-4 hover:bg-primary-hover"
                        onClick={updateApplication}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                }
              </div>
              {/* Contact Info */}
              {/* <div className="w-full bg-primary p-4 rounded shadow-md mt-4">
                <h3 className="font-bold">Contact Information</h3>
              </div> */}
            </div>

            {/* Application Statuses */}
            <div className="w-1/4 bg-primary p-4 rounded ml-2 shadow-md">
              <div className="flex flex-row justify-between w-full items-center">
                <h3 className="font-bold">Application Statuses</h3>
                {editPrivilege && <button className="bg-primary text-primary rounded" onClick={() => setEditStatus(!editStatus)}>
                  <Icon
                    className="fa-regular cursor-pointer opacity-50"
                    icon="pen"
                  />
                </button>}
              </div>
              <div className="flex flex-row items-center justify-between my-4 border-primary-dimmed border-b">
                <p className="text-sm">Overall</p>
                {editStatus ? (
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
              {applicationStatus != application.status && <div className="mt-2">
                <textarea
                  value={statusNote as string}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Status Notes"
                  className="w-full text-primary bg-primary border border-gray-300 rounded"
                />
                <button
                  className="bg-secondary w-full text-primary rounded p-2 mt-4 hover:bg-primary-hover"
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
              </div>}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-primary mt-8 rounded shadow-md">
            <div className="flex flex-row items-center justify-between p-4 ">
              <h3 className="text-md font-bold">Documents</h3>
              <p onClick={toggleDocumentsSection} className="select-none  text-sm cursor-pointer ml-auto mr-2 opacity-60">{!isDocumentsToggled ? 'Hide' : 'Show'} Documents</p>
              <button onClick={toggleDocumentsSection} className={`transition-transform duration-300 ${isDocumentsToggled ? 'rotate-90' : 'rotate-0'}`}>
                <Icon
                  icon="circle-chevron-down cursor-pointer"
                  className="fa-solid"
                />
              </button>
            </div>
            {!isDocumentsToggled &&
              <div className="border-t border-primary-dimmed">
                <div className={`transition-opacity w-full duration-300 ease-in-out ${!isDocumentsToggled && application.applicationDocuments.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                  {application.applicationDocuments.length > 0 && (
                    <div className="flex flex-col justify-around">
                      {application.applicationDocuments.map((document: any, index) => (
                        <div key={index} className="flex flex-row items-center justify-end p-3 border-b border-primary-dimmed ">
                          <div className="flex flex-col mr-auto">
                            <div className="flex flex-row items-center">
                              <a
                                href={`https://storage.cloud.google.com${document.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary mr-2 hover:text-primary-hover underline capitalize"
                              >

                                {document?.documentType.replace(/_/g, ' ')}
                              </a>
                              <Icon
                                className="fa-regular cursor-pointer opacity-50"
                                icon="paperclip"
                              />
                            </div>
                            <p className="text-primary-dimmed" >Uploaded {new Date(document.createdOn).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col items-center mr-10">
                            <p className="text-sm text-primary-dimmed">Document Name</p>
                            <p>{document.documentName}</p>
                          </div>
                          <div className="flex flex-col items-center mr-10">
                            <p className="text-sm text-primary-dimmed">Description</p>
                            <p>{document.documentDescription || <span className="text-yellow-500">Missing</span>}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-sm text-primary-dimmed">Created By</p>
                            <p >{document.createdBy}</p>
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
                  <h3 className="text-md pb-2 font-medium">Upload a Document</h3>
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
              </div>}
          </div>

          {/* Vehicles */}
          <div className="bg-primary mt-8 rounded shadow-md w-full">
            <div className="flex flex-row items-center justify-between p-4 ">
              <h3 className="text-md font-bold">Vehicles</h3>
              <p onClick={toggleVehiclesSection} className="select-none  text-sm cursor-pointer ml-auto mr-2 opacity-60">{!isVehiclesToggled ? 'Hide' : 'Show'} Vehicles</p>
              <button onClick={toggleVehiclesSection} className={`transition-transform duration-300 ${isVehiclesToggled ? 'rotate-90' : 'rotate-0'}`}>
                <Icon
                  icon="circle-chevron-down cursor-pointer"
                  className="fa-solid"
                />
              </button>
            </div>
            {!isVehiclesToggled && <div className="flex flex-col">
              {vehicles.map((vehicle: any, index) => (
                <div key={index} className="grid grid-rows-1 grid-cols-12 gap-x-8 p-4 border-t border-primary-dimmed">

                  <div className="flex flex-col col-span-2 h-full">
                    <p className="text-primary-dimmed text-sm">Vin</p>
                    <p className="text-primary mt-2">{vehicle.content.vin || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2 h-full">
                    <p className="text-primary-dimmed text-sm mb-2">Insurance Criteria Status</p>
                    <select
                      onChange={evt => handleVehicleStatusChange(vehicle.id, evt.target.value)}
                      className="bg-transparent outline-none border-primary rounded "
                      value={vehicle.status}>
                      <option value="APPROVED">Approved</option>
                      <option value="DECLINED">Declined</option>
                      <option value="UNDERREVIEW">Under Review</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-primary-dimmed text-sm">Mileage</p>
                    <p className="text-primary mt-2">{vehicle.content.mileage || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-2">
                    <p className="text-primary-dimmed text-sm">Registration State</p>
                    <p className="text-primary mt-2">{vehicle.content.registrationState || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-1">
                    <p className="text-primary-dimmed text-sm">License Plate</p>
                    <p className="text-primary mt-2">{vehicle.content.licensePlate || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-1">
                    <p className="text-primary-dimmed text-sm">Nickname</p>
                    <p className="text-primary mt-2">{vehicle.content.nickName || <span className="text-yellow-500">Missing</span>}</p>
                  </div>

                  <div className="flex flex-col col-span-3 items-center justify-center">
                    <a href={`/vehicles/detail?vin=${vehicle.content.vin}`} target="_blank" className="underline flex flex-row items-center justify-center font-medium">
                      <p className="mr-2" >Underwriting Report</p>
                      <Icon
                        className="fa-regular cursor-pointer opacity-50"
                        icon="external-link"
                      />
                    </a>
                  </div>

                </div>
              ))}
              {vehicles.length === 0 && <div className="flex flex-row items-center justify-between p-4 border-t border-primary-dimmed">
                <p className="text-primary">No vehicles added yet</p>
              </div>
              }


            </div>}
          </div>

          {/* Tabs */}
          <div className="bg-primary my-8 rounded shadow-md">
            {/* Tab headers */}
            <div className="flex flex-row items-center justify-between p-4 border-primary-dimmed">
              <div className="space-x-8">
                <button
                  className={`text-xl font-medium ${activeTab === 'comments' ? 'text-primary' : 'text-primary-dimmed'} font-serif`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button>
                <button
                  className={`text-xl font-medium ${activeTab === 'changelog' ? 'text-primary' : 'text-primary-dimmed'} font-serif`}
                  onClick={() => setActiveTab('changelog')}
                >
                  Changelog
                </button>
              </div>
            </div>

            {/* Comments */}
            {activeTab === 'comments' && (
              <div className="flex flex-col justify-around border-t border-primary-dimmed">
                {comments?.length > 0 ? (
                  comments.map((comment: any, index) => (
                    <div key={index} className="flex flex-row items-center justify-end p-4 border-b border-primary-dimmed">
                      <div className="flex flex-col mr-auto">
                        <p className="text-primary">{comment.comment}</p>
                        <p className="text-primary-dimmed">{comment.createdBy}</p>
                      </div>
                      <p className="text-primary-dimmed">{new Date(comment.createdOn).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-row items-center justify-start p-4">
                    <p className="text-primary">No comments yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Changelog */}
            {activeTab === 'changelog' && (
              <div className="flex flex-col justify-around border-t border-primary-dimmed">
                {application?.statusHistory?.length > 0 ? (
                  application.statusHistory
                    .filter((statusHistory: any) => statusHistory.status !== 'DRAFT')
                    .reverse()
                    .map((statusHistory: any, index) => (
                      <div key={index} className="flex flex-row items-center justify-end p-4 border-b border-primary-dimmed">
                        <div className="flex flex-col mr-auto">
                          {statusHistory.note && <p className="text-primary">&ldquo;{statusHistory.note}&rdquo;</p>}
                          <p className="text-primary">Application status changed to {statusHistory.status}</p>
                          <p className="text-primary-dimmed">{statusHistory.createdBy}</p>
                        </div>
                        <p className="text-primary-dimmed">{new Date(statusHistory.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-row items-center justify-start p-4 border-t border-primary-dimmed">
                    <p className="text-primary">No status changes yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Comment Box */}
            {activeTab === 'comments' && (
              <div className="p-4">
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:border-primary bg-primary text-primary"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <button className="mt-2 bg-secondary py-1 px-4 rounded hover:bg-primary-hover" onClick={uploadComment}>
                  Submit Comment
                </button>
              </div>
            )}
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
