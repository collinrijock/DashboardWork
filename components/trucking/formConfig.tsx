import { RJSFSchema, SubmitButtonProps, getSubmitButtonOptions } from '@rjsf/utils';
export const formSchema: RJSFSchema = {
  type: "object",
  properties: {
    inputData: {
      type: "object",
      title: "",
      properties: {
        insured: {
          type: "object",
          properties: {
            businessLegalName: { type: "string", title: "Business Legal Name", default: "" },
            businessAddressLineOne: { type: "string", title: "Business Address Line One", default: "" },
            businessAddressLineTwo: { type: "string", title: "Business Address Line Two", default: "" },
            businessCity: { type: "string", title: "Business City", default: "" },
            businessZipcode: { type: "string", title: "Business Zipcode", default: "" },
            state: { type: "string", title: "State", default: "" }
          }
        },
        certificateHolder: {
          type: "object",
          properties: {
            businessLegalName: { type: "string", title: "Business Legal Name", default: "" },
            businessAddressLineOne: { type: "string", title: "Business Address Line One", default: "" },
            businessAddressLineTwo: { type: "string", title: "Business Address Line Two", default: "" },
            businessCity: { type: "string", title: "Business City", default: "" },
            businessZipcode: { type: "string", title: "Business Zipcode", default: "" },
            state: { type: "string", title: "State", default: "" }
          }
        },
        insurerA: {
          type: "object",
          properties: {
            code: { type: "string", title: "Insurer Code", default: "A" },
            name: { type: "string", title: "Name", default: "" },
            naic: { type: "string", title: "NAIC", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
          }
        },
        insurerB: {
          type: "object",
          properties: {
            code: { type: "string", title: "Insurer Code", default: "B" },
            name: { type: "string", title: "Name", default: "" },
            naic: { type: "string", title: "NAIC", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
          }
        },
        insurerC: {
          type: "object",
          properties: {
            code: { type: "string", title: "Insurer Code", default: "C" },
            name: { type: "string", title: "Name", default: "" },
            naic: { type: "string", title: "NAIC", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
          }
        },
        insurerD: {
          type: "object",
          properties: {
            code: { type: "string", title: "Insurer Code", default: "D" },
            name: { type: "string", title: "Name", default: "" },
            naic: { type: "string", title: "NAIC", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
          }
        },
        generalLiability: {
          type: "object",
          properties: {
            insurerCode: { type: "string", title: "Insurer Code", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
            limits: {
              type: "object",
              properties: {
                eachOccurrence: { type: "string", title: "Each Occurrence", default: "" },
                damageToRentedPremises: { type: "string", title: "Damage To Rented Premises", default: "" },
                medicalExpense: { type: "string", title: "Medical Expense", default: "" },
                personalAndAdvertisingInjury: { type: "string", title: "Personal And Advertising Injury", default: "" },
                generalAggregate: { type: "string", title: "General Aggregate", default: "" },
                productsCompletedOperationsAggregate: { type: "string", title: "Products Completed Operations Aggregate", default: "" }
              }
            },
            occur: { type: "string", title: "Occur", default: "" },
            claimsMade: { type: "string", title: "Claims made", default: "" },
            generalAggregateAppliesPerPolicy: { type: "string", title: "General Aggregate Applies Per Policy", default: "" }
          }
        },
        autoLiability: {
          type: "object",
          properties: {
            insurerCode: { type: "string", title: "Insurer Code", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
            limits: {
              type: "object",
              properties: {
                combinedSingleLimit: { type: "string", title: "Combined Single Limit", default: "" },
                bodilyInjuryPerPerson: { type: "string", title: "Bodily Injury Per Person", default: "" },
                bodilyInjuryPerAccident: { type: "string", title: "Bodily Injury Per Accident", default: "" },
                propertyDamagePerAccident: { type: "string", title: "Property Damage Per Accident", default: "" },
                otherCoverage: { type: "string", title: "Other Coverage", default: "" }
              }
            }
          }
        },
        motorCargoCoverage: {
          type: "object",
          properties: {
            description: { type: "string", title: "Description", default: "" },
            coverageCode: { type: "string", title: "Coverage Code", default: "" },
            insurerCode: { type: "string", title: "Insurer Code", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
            limit: { type: "string", title: "Limit", default: "" }
          }
        },
        autoPhysicalDamageCoverage: {
          type: "object",
          properties: {
            description: { type: "string", title: "Description", default: "" },
            coverageCode: { type: "string", title: "Coverage Code", default: "" },
            insurerCode: { type: "string", title: "Insurer Code", default: "" },
            policyNumber: { type: "string", title: "Policy Number", default: "" },
            effectiveDate: { type: "string", title: "Effective Date", default: "" },
            expirationDate: { type: "string", title: "Expiration Date", default: "" },
            limit: { type: "string", title: "Limit", default: "" }
          }
        },
        remarks: { type: "string", title: "Remarks", default: "" },
      },
    }
  }
};

const CustomTextWidget = (props: any) => {
  const { id, required, label, value, onChange } = props;
  return (
    <div className="mt-4 w-full">
      <label htmlFor={id} className="">
        {label}{required ? '*' : ''}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
      />
    </div>
  );
};

const CustomCheckboxWidget = (props: any) => {
  const { id, required, label, value, onChange } = props;
  return (
    <div className="mt-4">
      <input
        type="checkbox"
        id={id}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mr-2"
      />
      <label htmlFor={id}>
        {label}{required ? '*' : ''}
      </label>
    </div>
  );
};

const CustomFieldTemplate = (props: any) => {
  return (
    <div className="mt-4 flex flex-col items-center w-full">
      {props.children}
    </div>
  );
}

const CustomButtonWidget = (props: any) => {
  const { id, required, label, value, onChange } = props;
  return (
    <div className="mt-4">
      <button
        type="button"
        id={id}
        value={value}
        className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
      >
        {label}{required ? '*' : ''}
      </button>
    </div>
  );
}

function SubmitButton(props: SubmitButtonProps) {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return (
    <button type='submit' className='bg-lula mt-10 hover:bg-primary-hover text-primary px-32  py-2 rounded-lg'>
      Submit
    </button>
  );
}

export const customTheme = {
  widgets: {
    TextWidget: CustomTextWidget,
    CheckboxWidget: CustomCheckboxWidget,
    ButtonWidget: CustomButtonWidget,
  },
  templates: {
    FieldTemplate: CustomFieldTemplate,
    ButtonTemplates: {
      SubmitButton
    }
  }
};
