import React, { useCallback, useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { Icon } from "@lula-technologies-inc/lux";
import { TableRow } from "../types/TableRow";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const Table: React.FC = () => {
  // Router
  const router = useRouter(); // State variables
  const [data, setData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterInsuranceProgram, setFilterInsuranceProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterDocuments, setFilterDocument] = useState(false);
  const [displayedRowCount, setDisplayedRowCount] = useState(15);
  const [updatedRowIds, setUpdatedRowIds] = useState<Set<string>>(new Set());
  const { token } = useFirebaseAuth();
  const [firstLoad, setFirstLoad] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Functions
  const loadMoreRows = () => {
    setDisplayedRowCount(displayedRowCount + 7);
  };
  const fetchData = useCallback(
    async (
      search: string,
      filterDate: string,
      filterInsuranceProgram: string,
      filterStatus: string,
      filterSource: string
    ) => {
      try {
        const queryParams = new URLSearchParams({
          search: search,
          sortDirection: "desc",
          ...(filterDate && { createdOn: filterDate }),
          ...(filterInsuranceProgram && {
            programName: filterInsuranceProgram,
          }),
          ...(filterStatus && { status: filterStatus }),
          ...(filterSource && { source: filterSource }),
        });
        let headers: HeadersInit = {};
        if (token) {
          headers = {
            "x-firebase-auth": token,
          };
        }
        const response = await fetch(`/api/applications?${queryParams}`, {
          headers: headers,
        });
        if (!response.ok) {
          throw new Error(`An error occurred: ${response.statusText}`);
        }
        let rawData = await response.json();
        rawData = rawData.items;
        if (filterDocuments) {
          // Filter out applications that don't have any objects in applicationData.applicationDocuments
          rawData = rawData.filter((item: any) => {
            return item.applicationData?.applicationDocuments?.length > 0;
          }
          );
        }
        const formattedData: TableRow[] = rawData.map((item: any) => {
          const applicationData = item.applicationData || {};
          const contactName = `${applicationData?.applicant?.firstName || ""} ${applicationData?.applicant?.lastName || ""
            }`;
          return {
            id: item.id,
            createdDate: new Date(item.createdOn),
            status: item.status,
            businessName: applicationData.businessName || "",
            contactName,
            insuranceProgram: item.insuranceProgramName,
            source: item.source,
            contactEmail: applicationData?.applicant?.email || "",
            contactPhone: applicationData.phoneNumber || "",
          };
        });
        setData(formattedData);
        setUpdatedRowIds(new Set());
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setData([]);
      }
    },
    [filterDocuments, token]
  );

  useEffect(() => {
    if (token) {
      // If it's the first load, fetch immediately and set firstLoad to false
      if (firstLoad) {
        fetchData(search, filterDate, filterInsuranceProgram, filterStatus, filterSource);
        setFirstLoad(false);
      } else {
        // If not the first load, then add the debounce
        const timeoutId = window.setTimeout(() => {
          fetchData(search, filterDate, filterInsuranceProgram, filterStatus, filterSource);
        }, 300); // 100ms delay

        // Cleanup function to clear timeout if effect re-runs before timeout finishes
        return () => window.clearTimeout(timeoutId);
      }
    }
  }, [
    fetchData,
    search,
    filterDate,
    filterInsuranceProgram,
    filterStatus,
    filterSource,
    token,
    firstLoad,
    filterDocuments
  ]);

  const navigateToApplicantDetailPage = (row: TableRow) => {
    router.push({
      pathname: "/applications/detail",
      query: { id: row.id },
    });
  };

  return (
    <div className="font-sans py-4">
      <div className="flex flex-row mb-4 items-center">
        <div className="relative w-full border-none px-2 bg-primary rounded-md flex flex-row items-center justify-center shadow-md">
          <Icon
            icon="magnifying-glass"
            className="ml-1 fa-solid text-primary-dimmed"
          />
          <input
            type="text"
            placeholder="Search business name,  first  /  last name,  email  or  phone number"
            className="w-full box-border pl-6 pr-4 border-none bg-primary text-sm py-3 placeholder-primary-dimmed tracking-wider"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>
        {/* Filter toggle */}
        <button
          className="ml-4 w-11 h-11 p-0 bg-primary rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md flex items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
          title={"Show / hide filters"}
        >
          <Icon
            icon="filter"
            className="fa-solid text-primary-dimmed p-0"
          />
        </button>
      </div>

      {/* Filter Tray */}
      <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className={`flex flex-row gap-x-10 mb-4 ${showFilters ? 'block' : 'hidden'}`}>

          <input
            type="text"
            placeholder="Filter by Created Date"
            className="w-full border-none p-2 rounded bg-primary text-xs col-span-1 shadow-md placeholder-primary-dimmed"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            onFocus={(e) => e.target.type = "date"}
          />
          <select
            className="w-full border-none p-2 rounded bg-primary text-xs shadow-md text-primary-dimmed"
            value={filterInsuranceProgram}
            onChange={(e) => setFilterInsuranceProgram(e.target.value)}
          >
            <option value="">Filter by Insurance Program</option>
            <option value="ContinuousCoverage">Continuous Coverage</option>
            <option value="ORP">ORP</option>
            <option value="SLI">SLI</option>
          </select>
          <select
            className="w-full border-none p-2 rounded bg-primary text-xs shadow-md text-primary-dimmed"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Filter by Application Status</option>
            <option value="New">New</option>
            <option value="Underreview">Under Review</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            className="w-full border-none p-2 rounded bg-primary text-xs shadow-md text-primary-dimmed"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="">Filter by Source</option>
            <option value="OnBoarding">On Boarding</option>
            <option value="PublicAPI">Public API</option>
          </select>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ease-in-out ${data.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <table className="table-auto bg-primary w-full rounded-md text-xs shadow-md overflow-hidden">
          <thead>
            <tr>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                CREATED
              </th>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                STATUS
              </th>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                BUSINESS
              </th>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                CONTACT
              </th>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                PROGRAM
              </th>
              <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">
                SOURCE
              </th>
              <th className="p-4 text-end"></th>
            </tr>
          </thead>
          <tbody>
            {/* normal row */}
            {data.slice(0, displayedRowCount).map((row, index) => (
              <React.Fragment key={row.id}>
                <tr
                  key={row.id}
                  className="table-row transition-all duration-50 hover:bg-primary-hover font-normal border-primary-hover overflow-hidden border-t"
                >
                  <td className="px-4 py-2">
                    {row.createdDate?.toDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {row.status}
                  </td>
                  <td className="px-4 py-2">
                    <p className="truncate w-40">
                      {row.businessName?.length > 1 ? row.businessName : <span className="text-yellow-500">Missing</span>}
                    </p>
                  </td>
                  <td className="px-4 py-2">
                    <p className="truncate w-40">
                      {row.contactName?.length > 1 ? row.contactName : <span className="text-yellow-500">Missing</span>}
                    </p>
                  </td>
                  <td className="px-4 py-2">
                    {row.insuranceProgram}
                  </td>
                  <td className="px-4 py-2">
                    {row.source}
                  </td>
                  <td className="px-4 py-2" onClick={() => navigateToApplicantDetailPage(row)}>
                    <Icon
                      icon="arrow-right-to-line solid"
                      className="cursor-pointer mr-1 text-primary-dimmed hover:text-primary"
                      size={2}
                    />
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          {data.length > displayedRowCount && (
            <tfoot>
              <tr>
                <td colSpan={8} className="text-center p-4">
                  <button
                    className="font-normal text-sm border border-primary-dimmed px-6 py-1 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
                    onClick={loadMoreRows}
                  >
                    Load more data
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
export default Table;
