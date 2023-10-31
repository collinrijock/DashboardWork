import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
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

type Account = {
    BusinessLegalName: string;
    BusinessAddressLine1: string;
    BusinessAddressLine2: string;
    BusinessCity: string;
    BusinessState: string;
    BusinessZipCode: string;
    autoLiability: autoLiability;
    cargo: cargo;
    physicalDamage: physicalDamage;
    generalLiability: generalLiability;
}
export default function AddAccount() {
    // get values from http GET and display in dropdown
    const [values, setValues] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
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
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Do something with the form data
        console.log(formData);
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
    <form onSubmit={handleSubmit}>

        <div>
                <div>
                    <h2>Add Account</h2>
                    <input type={"text"} name="BusinessLegalName" value={formData.BusinessLegalName} onChange = {handleChange} placeholder={"Business Legal Name"} /><br/>                
                    <input type={"text"} name="BusinessAddressLine1" value={formData.BusinessAddressLine1} onChange={handleChange} placeholder={"Line 1"} />
                    <input type={"text"} name="BusinessAddressLine2" value={formData.BusinessAddressLine2} onChange={handleChange} placeholder={"Line 2"} /><br/>
                    <input type={"text"} name="BusinessCity" value={formData.BusinessCity} onChange={handleChange} placeholder={"Business City"} />
                    <input type={"text"} name="BusinessState" value={formData.BusinessState} onChange={handleChange} placeholder={"Business State"} />
                    <input type={"text"} name="BusinessZipCode" value={formData.BusinessZipCode} onChange={handleChange} placeholder={"Business Zip"} />                
                </div>
                <div>
                    <br/>
                    <h2>Add Auto Liability</h2>
                
                    <input type={"text"} name="formData.autoLiability.policyNumber" value={formData.autoLiability.policyNumber} onChange={handleChange} placeholder={"Policy Number"} />
                    <input type={"text"} name="autoLiability.startDate" placeholder={"Effective Date"} />
                    <input type={"text"} name="autoLiability.endDate" placeholder={"Expiration Date"} />
                    <select name="autoLiability.insurerId">
                        {insurers.map((insurer) => {
                            return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
                        })}
                    </select>
                    <input type={"text"} name="autoLiability.coverageData.combinedSingleLimit" placeholder={"Combined Single Limit"} />
                </div>
                <div>
                    <br/>
                    <h2>Add Cargo</h2>
                    
                    <input type={"text"} name="policyNumber" placeholder={"Policy Number"} />
                    <input type={"text"} name="startDate" placeholder={"Effective Date"} />
                    <input type={"text"} name="endDate" placeholder={"Expiration Date"} />
                    <select name="insurerId">
                        {insurers.map((insurer) => {
                            return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
                        })}
                    </select>
                    <input type={"text"} name="limit" placeholder={"Cargo Limit"} />
                    <input type={"text"} name="deductible" placeholder={"Cargo Deductible"} />
                    <input type={"text"} name="Trailer Interchange Limit" placeholder={"Trailer Interchange Limit"} />
                    <input type={"text"} name="reeferDeductible" placeholder={"Reefer Deductible"} />
                    
                </div>
                <div>
                    <br/>
                    <h2>Add Physical Damage</h2>
    
                    <input type={"text"} name="policyNumber" placeholder={"Policy Number"} />
                    <input type={"text"} name="startDate" placeholder={"Effective Date"} />
                    <input type={"text"} name="endDate" placeholder={"Expiration Date"} />
                    <select name="insurerId">
                        {insurers.map((insurer) => {
                            return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
                        })}
                    </select>
                    <input type={"text"} name="deductible" placeholder={"Deductible"} />
                </div>
                <div>
                    <br/>
                    <h2>Add General Liability</h2>
    
                    <input type={"text"} name="policyNumber" placeholder={"Policy Number"} />
                    <input type={"text"} name="startDate" placeholder={"Effective Date"} />
                    <input type={"text"} name="endDate" placeholder={"Expiration Date"} />
                    <select name="insurerId">
                        {insurers.map((insurer) => {
                            return <option key={insurer.id} value={insurer.id}>{insurer.name}</option>;
                        })}
                    </select>
                </div>
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>);
}