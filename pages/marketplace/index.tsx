import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect} from "react";
import { useAuthContext } from "@/hooks/auth";
import axios from "axios";

interface coverage{
    policyNumber: string;
    startDate: string;
    endDate: string;
    insurerId: string;
}
interface autoLiability extends coverage{
    coverageData:{ combinedSingleLimit: string;}
}
interface cargo extends coverage{
    coverageData:{
        limit: string;
        deductible: string;
        trailerInterchangeLimit: string;
        reeferDeductible: string;
    }
}
interface physicalDamage extends coverage{
    coverageData:{
        deductible: string;
    }
}
interface generalLiability extends coverage{
    coverageData:{
        limits: {
            eachOccurrence: string;
            damageToRentedPremises: string;
            medicalExpense:string;
            personalAndAdvertisingInjury: string;
            generalAggregate: string;
            productsCompletedOperationsAggregate: string;
        };
        occur: string;
        claimsMade: string;
        generalAggregateAppliesPerPolicy: string;
    }
}

type User = {
    emailAddress: string;
    givenName: string;
    familyName: string;
}

type Account = {
    BusinessLegalName: string;
    BusinessAddressLine1: string;
    BusinessAddressLine2: string;
    BusinessCity: string;
    BusinessState: string;
    BusinessZipCode: string;
    User: User;
    autoLiability: autoLiability;
    cargo: cargo;
    physicalDamage: physicalDamage;
    generalLiability: generalLiability;
    [key: string]: any;
}
export default function AddAccount() {
    // get values from http GET and display in dropdown
    const [submissionResponse, setSubmissionResponse] = useState<string>();
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { isAuthenticated, getToken, user } = useAuthContext();
    const [insurers, setInsurers] = useState<any[]>([]);
    const router = useRouter();
    const { id } = router.query;
    const [formData, setFormData] = useState<Account>({
        BusinessLegalName: "",
        BusinessAddressLine1: "",
        BusinessAddressLine2: "",
        BusinessCity: "",
        BusinessState: "",
        BusinessZipCode: "",
        User: {
            emailAddress: "",
            givenName: "",
            familyName: "",
        },
        autoLiability: {
            policyNumber: "",
            startDate: "",
            endDate: "",
            insurerId: "",
            coverageData: {
                combinedSingleLimit: "",
            }
        },
        cargo: {
            policyNumber: "",
            startDate: "",
            endDate: "",
            insurerId: "",
            coverageData: {
                limit: "",
                deductible: "",
                trailerInterchangeLimit: "",
                reeferDeductible: "",
            }
        },
            
        physicalDamage: {
            policyNumber: "",
            startDate: "",
            endDate: "",                
            insurerId: "",
            coverageData: {
                deductible: "",
            }
        },
        generalLiability: {
            policyNumber: "",
            startDate: "",
            endDate: "",
            insurerId: "",
            coverageData: {
                limits: {
                    eachOccurrence: "",
                    damageToRentedPremises: "",
                    medicalExpense: "",
                    personalAndAdvertisingInjury: "",
                    generalAggregate: "",
                    productsCompletedOperationsAggregate: "",
                },
                occur: "",
                claimsMade: "",
                generalAggregateAppliesPerPolicy: "",
            }
        }        
    });
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
        // Split the name by dot to access nested properties
        const [category, property, subProperty, subSubProperty] = name.split('.');

        if (subSubProperty) {
            return {
                ...prevData,
                [category]: {
                    ...prevData[category],
                    [property]: {
                        ...prevData[category][property],
                        [subProperty]: {
                            ...prevData[category][property][subProperty],
                            [subSubProperty]: value,
                        },
                    },
                },
            };
        }  
        else if (subProperty) {
            return {
                ...prevData,
                [category]: {
                    ...prevData[category],
                    [property]: {
                        ...prevData[category][property],
                        [subProperty]: value,
                    },
                },
            };
        } else if (property) {
            return {
                ...prevData,
                [category]: {
                    ...prevData[category],
                    [property]: value,
                },
            };
        } else {
            return {
                ...prevData,
                [category]: value,
            };
        }
        });
    };
         
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Do something with the form data
        const token = await getToken();
        const resp = await fetch("/api/marketplace/saveCoverage", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData)
        });

        setSubmissionResponse(resp.statusText);
        setIsDialogOpen(true);
    };
    const getInsurers = async () => {
        const token = await getToken();
        const insurersResp = await fetch("/api/marketplace/insurers", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        setInsurers(await insurersResp.json());
    }
    useEffect(() => {
        if (isAuthenticated) {
            getInsurers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);


        return(
            <div>
    <form onSubmit={handleSubmit}>
    <div>
    <div>
        <h2>Add Account</h2>
        <input
            type="text"
            name="BusinessLegalName"
            value={formData.BusinessLegalName}
            onChange={handleChange}
            placeholder="Business Legal Name"
        /><br/>
        <input
            type="text"
            name="BusinessAddressLine1"
            value={formData.BusinessAddressLine1}
            onChange={handleChange}
            placeholder="Line 1"
        />
        <input
            type="text"
            name="BusinessAddressLine2"
            value={formData.BusinessAddressLine2}
            onChange={handleChange}
            placeholder="Line 2"
        /><br/>
        <input
            type="text"
            name="BusinessCity"
            value={formData.BusinessCity}
            onChange={handleChange}
            placeholder="Business City"
        />
        <input
            type="text"
            name="BusinessState"
            value={formData.BusinessState}
            onChange={handleChange}
            placeholder="Business State"
        />
        <input
            type="text"
            name="BusinessZipCode"
            value={formData.BusinessZipCode}
            onChange={handleChange}
            placeholder="Business Zip"
        />
    </div>
        <div>
            <br/>
            <h2>Add User</h2>
            <input
                type="text"
                name="User.emailAddress"
                value={formData.User.emailAddress}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                type="text"
                name="User.givenName"
                value={formData.User.givenName}
                onChange={handleChange}
                placeholder="First Name"
            />
            <input
                type="text"
                name="User.familyName"
                value={formData.User.familyName}
                onChange={handleChange}
                placeholder="Last Name"
            />
        </div>
    <div>
        <br/>
        <h2>Add Auto Liability</h2>
        <input
            type="text"
            name="autoLiability.policyNumber"
            value={formData.autoLiability.policyNumber}
            onChange={handleChange}
            placeholder="Policy Number"
        />
        <input
            type="date"
            name="autoLiability.startDate"
            value={formData.autoLiability.startDate}
            onChange={handleChange}
            placeholder="Effective Date"
        />
        <input
            type="date"
            name="autoLiability.endDate"
            value={formData.autoLiability.endDate}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}
            placeholder="Expiration Date"
            />
            <select name="autoLiability.insurerId" onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}>
                {insurers.map((insurer) => {
                return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
            })}
        </select>
        <input
            type="text"
            name="autoLiability.coverageData.combinedSingleLimit"
            value={formData.autoLiability.coverageData.combinedSingleLimit}
            onChange={handleChange}
            placeholder="Combined Single Limit"
        />
    </div>
    <div>
        <br/>
        <h2>Add Cargo</h2>
        <input
            type="text"
            name="cargo.policyNumber"
            value={formData.cargo.policyNumber}
            onChange={handleChange}
            placeholder="Policy Number"
        />
        <input
            type="date"
            name="cargo.startDate"
            value={formData.cargo.startDate}
            onChange={handleChange}
            placeholder="Effective Date"
        />
        <input
            type="date"
            name="cargo.endDate"
                    value={formData.cargo.endDate}
                    onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}
                    placeholder="Expiration Date"
                />
                <select name="cargo.insurerId" onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}>
                    {insurers.map((insurer) => {
                return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
            })}
        </select>
        <input
            type="text"
            name="cargo.coverageData.limit"
            value={formData.cargo.coverageData.limit}
            onChange={handleChange}
            placeholder="Cargo Limit"
        />
        <input
            type="text"
            name="cargo.coverageData.deductible"
            value={formData.cargo.coverageData.deductible}
            onChange={handleChange}
            placeholder="Cargo Deductible"
        />
        <input
            type="text"
            name="cargo.coverageData.trailerInterchangeLimit"
            value={formData.cargo.coverageData.trailerInterchangeLimit}
            onChange={handleChange}
            placeholder="Trailer Interchange Limit"
        />
        <input
            type="text"
            name="cargo.coverageData.reeferDeductible"
            value={formData.cargo.coverageData.reeferDeductible}
            onChange={handleChange}
            placeholder="Reefer Deductible"
        />
    </div>
    <div>
        <br/>
        <h2>Add Physical Damage</h2>
        <input
            type="text"
            name="physicalDamage.policyNumber"
            value={formData.physicalDamage.policyNumber}
            onChange={handleChange}
            placeholder="Policy Number"
        />
        <input
            type="date"
            name="physicalDamage.startDate"
            value={formData.physicalDamage.startDate}
            onChange={handleChange}
            placeholder="Effective Date"
        />
        <input
            type="date"
            name="physicalDamage.endDate"
                value={formData.physicalDamage.endDate}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Expiration Date"
            />
            <select name="physicalDamage.insurerId" onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}>
                {insurers.map((insurer) => {
                return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
            })}
        </select>
        <input
            type="text"
            name="physicalDamage.coverageData.deductible"
            value={formData.physicalDamage.coverageData.deductible}
            onChange={handleChange}
            placeholder="Deductible"
        />
    </div>
    <div>
        <br/>
        <h2>Add General Liability</h2>
        <input
            type="text"
            name="generalLiability.policyNumber"
            value={formData.generalLiability.policyNumber}
            onChange={handleChange}
            placeholder="Policy Number"
        />
        <input
            type="date"
            name="generalLiability.startDate"
            value={formData.generalLiability.startDate}
            onChange={handleChange}
            placeholder="Effective Date"
        />
        <input
            type="date"
            name="generalLiability.endDate"
            value={formData.generalLiability.endDate}
            onChange={handleChange}
            placeholder="Expiration Date"
        />
            <input
        type="text"
        name="generalLiability.coverageData.limits.eachOccurrence"
        value={formData.generalLiability.coverageData.limits.eachOccurrence}
        onChange={handleChange}
        placeholder="Each Occurrence"
    />
    <input
        type="text"
        name="generalLiability.coverageData.limits.damageToRentedPremises"
        value={formData.generalLiability.coverageData.limits.damageToRentedPremises}
        onChange={handleChange}
        placeholder="Damage to Rented Premises"
    />
    <input
        type="text"
        name="generalLiability.coverageData.limits.medicalExpense"
        value={formData.generalLiability.coverageData.limits.medicalExpense}
        onChange={handleChange}
        placeholder="Medical Expense"
    />
    <input
        type="text"
        name="generalLiability.coverageData.limits.personalAndAdvertisingInjury"
        value={formData.generalLiability.coverageData.limits.personalAndAdvertisingInjury}
        onChange={handleChange}
        placeholder="Personal and Advertising Injury"
    />
    <input
        type="text"
        name="generalLiability.coverageData.limits.generalAggregate"
        value={formData.generalLiability.coverageData.limits.generalAggregate}
        onChange={handleChange}
        placeholder="General Aggregate"
    />
    <input
        type="text"
        name="generalLiability.coverageData.limits.productsCompletedOperationsAggregate"
        value={formData.generalLiability.coverageData.limits.productsCompletedOperationsAggregate}
        onChange={handleChange}
        placeholder="Products Completed Operations Aggregate"
    />
    <input
        type="text"
        name="generalLiability.coverageData.occur"
        value={formData.generalLiability.coverageData.occur}
        onChange={handleChange}
        placeholder="Occurrence"
    />
    <input
        type="text"
        name="generalLiability.coverageData.claimsMade"
        value={formData.generalLiability.coverageData.claimsMade}
        onChange={handleChange}
        placeholder="Claims Made"
    />
    <input
        type="text"
        name="generalLiability.coverageData.generalAggregateAppliesPerPolicy"
        value={formData.generalLiability.coverageData.generalAggregateAppliesPerPolicy}
        onChange={handleChange}
        placeholder="General Aggregate Applies Per Policy"
    />
        <select name="generalLiability.insurerId" onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleChange(event as React.ChangeEvent<HTMLInputElement>)}>
            {insurers.map((insurer) => {
                return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
            })}
        </select>
    </div>
</div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
    <div className='flex flex-col items-start p-4 relative' hidden={!isDialogOpen} onClick={() => setIsDialogOpen(false)}>
                {submissionResponse && <p>API Response: {submissionResponse}</p>}
        </div>
    </div>
    );
}