import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/common/header';

interface Field {
  label: string;
  key: string[];
}

interface Section {
  title: string;
  fields: Field[];
}

const ApplicationDetail = () => {
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      axios.get(`/api/get-application?id=${id}`).then((response) => {
        setApplication(response.data);
      });
    }
  }, [id]);

  const sectionsConfig: Section[] = [
    {
      title: "Applicant Information",
      fields: [
        { label: "First Name", key: ["firstName"] },
        { label: "Last Name", key: ["lastName"] },
        { label: "Email", key: ["email"] },
        { label: "Phone", key: ["phone"] },
      ],
    },
    {
      title: "Business Information",
      fields: [
        { label: "EIN", key: ["ein"] },
        { label: "Fleet Size", key: ["fleetSize"] },
        { label: "Business Name", key: ["businessName"] },
        { label: "Address Line 1", key: ["businessAddress", "addressLine1"] },
        { label: "Address Line 2", key: ["businessAddress", "addressLine2"] },
        { label: "City", key: ["businessAddress", "city"] },
        { label: "State", key: ["businessAddress", "state"] },
        { label: "ZIP", key: ["businessAddress", "zip"] },
        { label: "Country", key: ["businessAddress", "country"] },
      ],
    },
    {
      title: "Insurance Program",
      fields: [
        { label: "Name", key: ["insuranceProgramName"] },
        { label: "Version", key: ["insuranceProgramVersion"] },
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



  return (
    <div className="bg-secondary">
      <button onClick={() => router.back()} className="bg-primary hover:bg-primary-hover p-2 m-4 rounded">
        Back
      </button>
      <div className="container mx-auto p-4">
      <h1 className="w-full text-6xl p-2">Application Details</h1>

        {sectionsConfig.map((section, sectionIndex) => (
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
        ))}

      </div>
    </div>
  );
};

export default ApplicationDetail;
