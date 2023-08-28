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
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="relative w-full col-span-2 border-none px-2 bg-primary rounded-sm flex flex-row items-center justify-center">
          <Icon
            icon="magnifying-glass"
            className="ml-1 fa-solid text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full box-border pl-6 pr-4 border-none bg-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="date"
          placeholder="dd/mm/yyyy"
          className="w-full border-none px-2 rounded bg-primary text-sm col-span-2"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="w-full border-none p-2 rounded bg-primary text-xs"
          value={filterInsuranceProgram}
          onChange={(e) => setFilterInsuranceProgram(e.target.value)}
        >
          <option value="">Filter by Insurance Program</option>
          <option value="ContinuousCoverage">Continuous Coverage</option>
          <option value="ORP">ORP</option>
          <option value="SLI">SLI</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Filter by Application Status</option>
          <option value="New">New</option>
          <option value="Incomplete">Incomplete</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-xs"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">Filter by Source</option>
          <option value="OnBoarding">On Boarding</option>
          <option value="CAVF">CAVF</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-xs"
          value={filterSource}
          onChange={(e) => setFilterDocument(e.target.value == "coi")}
        >
          <option value="">Filter by Documents</option>
          <option value={"coi"}>COI</option>
        </select>
        {/* <button
          className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
          onClick={clearFilters}
        >
          Clear Filters
        </button> */}
      </div>

      <div className={`transition-opacity duration-300 ease-in-out ${data.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
        <table className="table-auto bg-primary w-full rounded-lg text-xs overflow-hidden">
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

                  <td className="px-4 py-2">{row.createdDate.toDateString()}</td>
                  <td
                    className={`px-4 py-2 ${updatedRowIds.has(String(row.id))
                      ? "bg-briefly-changed"
                      : ""
                      }`}
                  >
                    {row.status}
                  </td>
                  <td className="px-4 py-2">{row.businessName}</td>
                  <td className="px-4 py-2">{row.contactName}</td>
                  <td className="px-4 py-2">{row.insuranceProgram}</td>
                  <td className="px-4 py-2">{row.source}</td>
                  <td
                    className="px-4 py-2"
                    onClick={() => navigateToApplicantDetailPage(row)}
                  >
                    <Icon
                      icon="arrow-right-to-line solid"
                      className="cursor-pointer mr-1 text-primary-dimmed hover:text-primary"
                      size={2}
                    />
                  </td>
                </tr>
              </React.Fragment>
            ))}
            {/* empty row */}
            {data.length == 0 &&
              Array.from({ length: displayedRowCount - data.length }, (_, i) => (
                <tr
                  key={`empty-row-${i}`}
                  className="table-row w-full font-normal overflow-hidden relative"
                ></tr>
              ))}
          </tbody>
          {data.length > displayedRowCount && (
            <tfoot>
              <tr>
                <td colSpan={8} className="text-center p-4">
                  <button
                    className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
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
