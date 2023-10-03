import { useState } from 'react';
import Head from 'next/head';
import { useAuthContext } from '@/hooks/auth';

const PostPolicy = () => {
    const [accountEntityId, setAccountEntityId] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [limit, setLimit] = useState('');
    const [deductible, setDeductible] = useState('');
    const [recentRequests, setRecentRequests] = useState<string[]>([]);
    const { getToken } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const handleNumberInput = (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        const formattedValue = event.target.value.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setter(formattedValue);
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch("/api/policies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    accountEntityId,
                    policyNumber,
                    limit,
                    deductible,
                }),
            });

            if (response.ok) {
                alert("Policy submitted successfully!");
                const newRequest = `${accountEntityId} - ${policyNumber} - ${limit} - ${deductible}`;
                setRecentRequests((prev) => [newRequest, ...prev.slice(0, 9)]);
                clearForm();
            } else {
                alert("Failed to submit the policy. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting policy:", error);
            alert("An error occurred while submitting the policy. Please try again.");
        } finally {
            setLoading(false); 
        }
    };




    const clearForm = () => {
        setAccountEntityId('');
        setPolicyNumber('');
        setLimit('');
        setDeductible('');
    };

    return (
        <div className="flex flex-col mt-8 animate-fade-in bg-secondary min-h-screen">
            <Head>
                <title>Trucking Portal v0</title>
            </Head>
            <form className='' onSubmit={submitForm}>
                <label htmlFor="accountEntityId" className="block">
                    Account Entity ID (Ex: 12345)
                </label>
                <input
                    type="text"
                    id="accountEntityId"
                    value={accountEntityId}
                    onChange={(e) => setAccountEntityId(e.target.value)}
                    className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
                />

                <label htmlFor="policyNumber" className="block mt-4">
                    Policy Number (Ex: E986763)
                </label>
                <input
                    type="text"
                    id="policyNumber"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
                />

                <label htmlFor="limit" className="block mt-4">
                    Limit (Ex: 100,000)
                </label>
                <input
                    type="text"
                    id="limit"
                    value={limit}
                    onChange={(e) => handleNumberInput(e, setLimit)}
                    className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
                />

                <label htmlFor="deductible" className="block mt-4">
                    Deductible (Ex: 2,500)
                </label>
                <input
                    type="text"
                    id="deductible"
                    value={deductible}
                    onChange={(e) => handleNumberInput(e, setDeductible)}
                    className="block w-full mt-2 p-2 border-none rounded bg-primary text-primary"
                />
                <div className="mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
                        disabled={loading} 
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <button
                        type="button"
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded"
                        onClick={clearForm}
                    >
                        Clear Form
                    </button>
                </div>
            </form>
            <div className="mt-12 p-8 bg-primary rounded-lg">
                <h1 className="text-4xl mb-4">Recently Added</h1>
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 font-normal text-left">Account Entity ID</th>
                            <th className="px-4 py-2 font-normal text-left">Policy Number</th>
                            <th className="px-4 py-2 font-normal text-left">Limit</th>
                            <th className="px-4 py-2 font-normal text-left">Deductible</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentRequests.map((request, index) => {
                            const [accountEntityId, policyNumber, limit, deductible] = request.split(' - ');
                            return (
                                <tr key={index}>
                                    <td className="px-4 py-2 text-left">{accountEntityId}</td>
                                    <td className="px-4 py-2 text-left">{policyNumber}</td>
                                    <td className="px-4 py-2 text-left">{limit}</td>
                                    <td className="px-4 py-2 text-left">{deductible}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div >
    );
};

export default PostPolicy;