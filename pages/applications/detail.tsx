import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface Field {
  label: string;
  key: string[];
}

interface Section {
  title: string;
  fields: Field[];
}

interface Application {
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
  };
  insuranceProgramName: string;
  insuranceProgramSchemaVersion: number;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
  status: string;
  tenantId: string;
  source: string;
}

  const ApplicationDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const { token } = useFirebaseAuth();


  const sectionsConfig: Section[] = [
    {
      title: "Applicant Information",
      fields: [
        { label: "First Name", key: ["applicationData", "applicant", "firstName"] },
        { label: "Last Name", key: ["applicationData", "applicant", "lastName"] },
        { label: "Email", key: ["applicationData", "applicant", "email"] },
        { label: "Phone", key: ["applicationData", "applicant", "phone"] },
      ],
    },
    {
      title: "Business Information",
      fields: [
        { label: "EIN", key: ["applicationData", "ein"] },
        { label: "Fleet Size", key: ["applicationData", "fleetSize"] },
        { label: "Business Name", key: ["applicationData", "businessName"] },
        { label: "Address Line 1", key: ["applicationData", "businessAddress", "addressLine1"] },
        { label: "Address Line 2", key: ["applicationData", "businessAddress", "addressLine2"] },
        { label: "City", key: ["applicationData", "businessAddress", "city"] },
        { label: "State", key: ["applicationData", "businessAddress", "state"] },
        { label: "ZIP", key: ["applicationData", "businessAddress", "zip"] },
        { label: "Country", key: ["applicationData", "businessAddress", "country"] },
      ],
    },
    {
      title: "Insurance Program",
      fields: [
        { label: "Name", key: ["insuranceProgramName"] },
        { label: "Version", key: ["insuranceProgramSchemaVersion"] },
      ],
    },
    {
      title: "Requester Information",
      fields: [
        { label: "Tenant ID", key: ["tenantId"] },
        { label: "Source", key: ["source"] },
        { label: "Created By", key: ["createdBy"] },
      ],
    },
  ];
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/application-details?id=${id}&token=${token}`);
        const data = await response.json();
        setApplication(data);
      } catch (error:any) {
        console.error('Error fetching application:', error.message);
      } finally {
        setLoading(false);
      }
    }
  
    if (token) {
      fetchApplication();
    }
  }, [token, id]);



  if (!id || !application) {
    return <div>
      <Head>
        <title>Not Found</title>
      </Head>
      <div className="bg-secondary">
        <button onClick={() => router.back()} className="bg-primary hover:bg-primary-hover p-2 m-4 rounded">
          Back
        </button>
        <div className="container mx-auto p-4">
          <h1 className="w-full text-6xl p-2">Application Details</h1>
          <p>Missing data</p>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="bg-secondary">
      <Head>
        <title>Applicant Details</title>
      </Head>
      <button onClick={() => router.back()} className="bg-primary hover:bg-primary-hover p-2 m-4 rounded">
        Back
      </button>
      <div className="container mx-auto p-4">
        <h1 className="w-full text-6xl p-2">Application Details</h1>
        {application ?
          sectionsConfig.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-primary p-4 my-4 rounded">
              <h3 className="text-xl font-serif mb-4">{section.title}</h3>
              {section.fields.map((field: Field, fieldIndex) => {
                const fieldValue = field.key.reduce((obj: any, key: string) => (obj && obj[key] !== undefined ? obj[key] : undefined), application);

                const isMissing = fieldValue === undefined;
                const displayValue = isMissing ? "Missing" : fieldValue;

                return (
                  <div key={fieldIndex} className="flex items-center my-2">
                    <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">{field.label}:</span>
                    <span className={`text-lg ${isMissing ? "text-yellow-500" : ""}`}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          )) : <div>Missing data</div>
        }
      </div>
    </div>
  );
};

export default ApplicationDetail;