import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function VehicleInfoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [underwritingChecks, setUnderwritingChecks] = useState(Array<any>());
  const router = useRouter();
  const { token } = useFirebaseAuth();
  const { vin } = router.query;

  useEffect(() => {
    const fetchUnderwritingChecks = async (vin : string, token : string) => {
      try {
        const res = await fetch(`/api/underwriting-details?vin=${vin}&token=${token}`);
        const data = await res.json();
        setUnderwritingChecks(data);
      } catch (error) {
        console.error('Error fetching underwriting details:', error);
      }
    };

    if (vin && token) {
      fetchUnderwritingChecks(String(vin), token);

    }
  }, [vin, token]);

  const formatDate = (dateString : string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const formatValue : any = (value : string) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${formatValue(val)}`)
        .join(', ');
    } else if (typeof value === 'string' && (value.includes('startDate') || value.includes('endDate'))) {
      return formatDate(value);
    } else {
      return value;
    }
  };

  const currentCheck = underwritingChecks[currentIndex];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-12">
        <h1 className="text-6xl p-2">Vehicle Details <span className='font-sans font-normal underline' >{vin}</span></h1>
        {currentCheck ?
          <div className='flex flex-row items-start gap-x-10 relative' >
            {/* Report History */}
            <div className="bg-primary p-2 rounded-md text-center flex flex-col items-center sticky top-8 shadow-md mt-4">
              <h2 className="text-xl font-serif mt-4 mb-2">Report History</h2>
              <div >
                {underwritingChecks.map((check : any, index) => (
                  <button
                    key={check.externalId}
                    onClick={() => setCurrentIndex(index)}
                    className={`block mb-2 p-4 border-primary-dimmed rounded-md cursor-pointer box-border ${currentIndex === index ? 'bg-primary-highlighted border-2' : 'bg-secondary'}`}
                  >
                    {new Date(check.timestamp).toLocaleString()} - {check.status}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-primary p-4 rounded mt-4 w-full">
              {/* User Inputs */}
              <div className="bg-primary p-4 rounded mt-4">
                <h2 className="text-xl font-serif mb-4">User Inputs</h2>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">Product:</span>
                  <span className="text-lg">{currentCheck.input.product}</span>
                </div>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">Source:</span>
                  <span className="text-lg">{JSON.parse(currentCheck.input.rawValue).source}</span>
                </div>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">Mileage:</span>
                  <span className="text-lg">{JSON.parse(currentCheck.input.rawValue).mileage.Mileage}</span>
                </div>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">State:</span>
                  <span className="text-lg">{JSON.parse(currentCheck.input.rawValue).state}</span>
                </div>
              </div>

              {/* Executed Rules */}
              <div className="bg-primary p-4 my-4 rounded">
                <h2 className="text-xl font-serif mb-4">Executed Rules:</h2>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Rule Name</th>
                      <th className='text-left'>Vehicle Value</th>
                      <th className='text-left'>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCheck.executedRules.map((rule : any, index : number) => (
                      <tr key={index} className="border-t border-primary-hover">
                        <td className="py-2 text-sm">
                          <span>{rule.name}</span>
                        </td>
                        <td className='text-sm'>{rule.rawInputValue}</td>
                        <td className={`text-sm ${rule.result === 'Fail' ? "text-red-600" : ""}`}>{rule.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Additional Information */}
              <div className="bg-primary p-4 my-4 rounded">
                <h2 className="text-xl font-serif mb-4">Additional Information:</h2>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">Turo:</span>
                  <span className="text-lg">{currentCheck.additionalInformation.turo}</span>
                </div>
                <div className="flex items-center my-2">
                  <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">GetAround:</span>
                  <span className="text-lg">{currentCheck.additionalInformation.getAround}</span>
                </div>
              </div>

              {/* ExtraData */}

              {currentCheck.extraData.map((data : any, index : number) => {
                if (data.provider === "UserInput") {
                  return null; // Skip rendering UserInput section
                }

                return (
                  <div key={index} className="bg-primary p-4 my-4 rounded">
                    <h2 className="text-xl font-serif mb-4">{data.provider} Information</h2>

                    {data.provider === "VinAudit" && data.rawValue.titles && (
                      <div className="my-4">
                        <h3 className="text-lg font-semibold">Titles:</h3>
                        <table className="border-collapse my-4 w-1/2 border-primary-hover">
                          <thead>
                            <tr>
                              <th className="border">Current</th>
                              <th className="border">Date</th>
                              <th className="border">State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.rawValue.titles.map((title : any, titleIndex : number) => (
                              <tr key={titleIndex}>
                                <td className="border py-1 px-2">{title.current.toString()}</td>
                                <td className="border py-1 px-2">{title.date}</td>
                                <td className="border py-1 px-2">{title.state}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {data.provider === "VinAudit" && data.rawValue.jsi && (
                      <div className="my-4">
                        <h3 className="text-lg font-semibold">JSI:</h3>
                        <table className="border-collapse my-4 w-1/2 border-primary-hover">
                          <thead>
                            <tr>
                              <th className="border">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.rawValue.jsi.map((jsiItem : any, jsiIndex : number) => (
                              <tr key={jsiIndex}>
                                <td className="border py-1 px-2">{jsiItem.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {data.provider === "LulaPolicyService" && data.rawValue.coverageHistory && (
                      <div className="my-4">
                        <h3 className="text-lg font-semibold">Coverage History:</h3>
                        <table className="w-1/2 border-collapse my-4 border-primary-hover">
                          <thead>
                            <tr>
                              <th className="border">Start Date</th>
                              <th className="border">End Date</th>
                              <th className="border">Vehicle Registration State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.rawValue.coverageHistory.map((history : any, historyIndex : number) => (
                              <tr key={historyIndex}>
                                <td className="border py-1 px-2">{history.startDate}</td>
                                <td className="border py-1 px-2">{history.endDate}</td>
                                <td className="border py-1 px-2">{history.vehicleRegistrationState}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {Object.entries(data.rawValue).map(([key, value], i) => {
                      if (key !== "titles" && key !== "jsi" && key !== "coverageHistory") {
                        return (
                          <div className="flex items-center my-2" key={i}>
                            <span className="w-1/4 text-primary-dimmed uppercase tracking-widest">{key}:</span>
                            <span className="text-lg">
                              {typeof value === "boolean" ? value.toString() : String(value)}
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                );
              })}

            </div>

          </div>
          :
          <div>Missing data</div>
        }
      </div>
    </div>
  );
}
