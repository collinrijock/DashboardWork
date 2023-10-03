// truckingCOI.js
import React, { useState } from 'react';
import { customTheme, formSchema } from './formConfig';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/core';
import { useAuthContext } from '@/hooks/auth';

const generateCertificateNumber = () => {
  const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `LCOI${randomNum}`;
};
const TruckingCOI = () => {
  const initialCertificateNumber = generateCertificateNumber();
  const [formData, setFormData] = useState({});
  const [jsonInput, setJsonInput] = useState("");
  const [isJSONAreaVisible, setJSONAreaVisible] = useState(false);
  const { getToken } = useAuthContext();

  function populateFormWithData() {
    try {
      const parsedData = JSON.parse(jsonInput);
      setFormData(parsedData);
    } catch (error) {
      alert("Invalid JSON provided");
    }
  }

  const mergeWithSpecialHandling = (source: any, target: any) => {
    const result: any = { ...source };

    for (const key in target) {
      if (key === "code") {
        result[key] = target[key];
      } else if (typeof target[key] === "object" && !Array.isArray(target[key]) && target[key] !== null) {
        result[key] = mergeWithSpecialHandling(source[key], target[key]);
      } else {
        result[key] = target[key];
      }
    }

    return result;
  }

  const getCoiDataWithPresets = () => {
    let data: any = formData;
    data.inputData.certificateNumber = initialCertificateNumber;
    data.inputData.formCompletionDate = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/${new Date().getFullYear()}`;
    data.OutputFile = `COI${data.inputData.formCompletionDate.replace(/\//g, '')}${data.inputData.insured.businessLegalName}${data.inputData.certificateHolder.businessLegalName}.pdf`;
    data.inputData.producer = {
      name: "Aster Insurance Solutions, LLC",
      address: {
        line1: "8950 SW 74 Court",
        line2: "",
        city: "Miami",
        state: "FL",
        zip: "33156"
      },
      contact: {
        name: "Aster Insurance Solutions, LLC",
        email: "support@lula.is",
        phone: "786-807-4455",
        fax: ""
      },
    };
    data.template = "coiArnie.jsonnet";
    data.templateFile = "templateFile.pdf";
    return data;
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const data = getCoiDataWithPresets()
      const token = await getToken();
      const response = await fetch("/api/policies/coi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      } else {
        alert("An error occurred while submitting the policy. Please try again.");
      }

    } catch (error) {
      alert("An error occurred while submitting the policy. Please try again.");
    }
  };
  return (
    <div className='flex flex-col items-center justify-center p-2'>
      <button onClick={() => setJSONAreaVisible(!isJSONAreaVisible)}>
        Toggle JSON Input
      </button>

      {isJSONAreaVisible && (
        <>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your JSON here"
            className='bg-primary w-3/4 h-64 mt-2'
          ></textarea>
          <button
            onClick={populateFormWithData}
            className='mt-2 bg-blue-500 text-white py-2 px-4 rounded'
          >
            Populate Form
          </button>
        </>
      )}

      <Form
        schema={formSchema}
        formData={formData}
        validator={validator}
        onChange={(e) => setFormData(e.formData)}
        className='w-full mt-4 flex flex-col items-center'
        onSubmit={(e) => submitForm(e as any)}
      />
    </div>
  );
}

export default TruckingCOI;
