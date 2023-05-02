import { useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const PostPolicy = () => {
    const [accountEntityId, setAccountEntityId] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [limit, setLimit] = useState('');
    const [deductible, setDeductible] = useState('');
    const [recentRequests, setRecentRequests] = useState<string[]>([]);
    const { token } = useFirebaseAuth();

    const handleNumberInput = (event: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        const formattedValue = event.target.value.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setter(formattedValue);
    };


    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_LULA_API_URL}/policy/${accountEntityId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'x-firebase-auth': token }),
                },
                body: JSON.stringify({
                    policyNumber,
                    limit,
                    deductible,
                }),
            });
    
            if (response.ok) {
                alert('Policy submitted successfully!');
                const newRequest = `Submitted: ${accountEntityId} - ${policyNumber} - ${limit} - ${deductible}`;
                setRecentRequests((prev) => [newRequest, ...prev.slice(0, 9)]);
                clearForm();
            } else {
                alert('Failed to submit the policy. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting policy:', error);
            alert('An error occurred while submitting the policy. Please try again.');
        }
    };
    


    const clearForm = () => {
        setAccountEntityId('');
        setPolicyNumber('');
        setLimit('');
        setDeductible('');
    };

    return (
        <div className="flex flex-col p-12 animate-fade-in bg-secondary min-h-screen">
            <h1 className="w-full text-6xl p-2">Trucking Policy Form</h1>
            <form className='mt-12' onSubmit={submitForm}>
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
                    >
                        Submit
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
            <div className="mt-12">
                <h1 className="text-4xl mb-4">Recently Added</h1>
                <ul>
                    {recentRequests.map((request, index) => (
                        <li key={index}>{request}</li>
                    ))}
                </ul>
            </div>
        </div >
    );
};

export default PostPolicy;


