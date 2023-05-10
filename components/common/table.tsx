import React, { useCallback, useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { Icon, ICON_SIZES } from "@lula-technologies-inc/lux";
import { TableRow } from "../../types/TableRow";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import axios from "axios";

const Table: React.FC = () => {
  // Router
  const router = useRouter();

  // State variables
  const [data, setData] = useState<TableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterInsuranceProgram, setFilterInsuranceProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [displayedRowCount, setDisplayedRowCount] = useState(7);
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());
  const [updatedRowIds, setUpdatedRowIds] = useState<Set<string>>(new Set());
  const { token } = useFirebaseAuth();

  // Functions
  const loadMoreRows = () => {
    setDisplayedRowCount(displayedRowCount + 7);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterDate("");
    setFilterInsuranceProgram("");
    setFilterStatus("");
  };

  const handleRowSelection = (id: string, isChecked: boolean) => {
    const newSelectedRows = new Set(selectedRows);

    if (isChecked) {
      newSelectedRows.add(id);
    } else {
      newSelectedRows.delete(id);
    }

    setSelectedRows(newSelectedRows);
  };

  const toggleRowExpanded = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const collapseAllRows = () => {
    setExpandedRows(new Set());
  };

  const fetchData = useCallback(async (
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
        ...filterDate && { createdOn: filterDate },
        ...filterInsuranceProgram && { programName: filterInsuranceProgram },
        ...filterStatus && { status: filterStatus },
        ...filterSource && { source: filterSource },
      });

      let headers: HeadersInit = {};
      if (token) {
        headers = {
          "x-firebase-auth": token,
        };
      }

      const response = await fetch(`/api/get-applications?${queryParams}`, {
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
      }

      let rawData = await response.json();
      rawData = rawData.items;
      const formattedData: TableRow[] = rawData.map((item: any) => {
        const applicationData = item.applicationData || {};
        const contactName = `${applicationData.firstName || ""} ${applicationData.lastName || ""
          }`;

        return {
          id: item.id,
          createdDate: new Date(item.createdOn),
          status: item.status,
          businessName: applicationData.businessName || "",
          contactName,
          insuranceProgram: item.insuranceProgramName,
          source: item.source,
          contactEmail: applicationData.email || "",
          contactPhone: applicationData.phoneNumber || "",
        };
      });
      setData(formattedData);
      setUpdatedRowIds(new Set());

    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setData([]);
    }
  }, [token]);



  useEffect(() => {
    if (token) {
      fetchData(
        search,
        filterDate,
        filterInsuranceProgram,
        filterStatus,
        filterSource
      );
    }
  }, [fetchData, search, filterDate, filterInsuranceProgram, filterStatus, filterSource, token]);

  const navigateToApplicantDetailPage = (row: TableRow) => {
    router.push({
      pathname: "/applications/detail",
      query: { id: row.id },
    });
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      let headers: HeadersInit = {};
      if (token) {
        headers = {
          "x-firebase-auth": token,
        };
      }
      await axios.post("/api/set-application-status", {
        id,
        status,
      }, {
        headers
      });

      setUpdatedRowIds(new Set([...updatedRowIds, id]));

      fetchData(search, filterDate, filterInsuranceProgram, filterStatus, filterSource);
    } catch (error: any) {
      console.error("Failed to update status:", error.message);
    }
  };


  // Actions on selected rows
  const approveSelectedRows = () => {
    for (const applicationId of Array.from(selectedRows)) {
      updateApplicationStatus(applicationId, "Approved");
    }
  };

  const rejectSelectedRows = () => {
    for (const applicationId of Array.from(selectedRows)) {
      updateApplicationStatus(applicationId, "Rejected");
    }
  };

  const requestMoreInfoSelectedRows = () => {
    for (const applicationId of Array.from(selectedRows)) {
      updateApplicationStatus(applicationId, "Request_more_info");
    }
  };

  return (
    <div className="font-sans py-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="relative w-full col-span-2 border-none px-2 bg-primary rounded-sm">
          <Icon
            icon="magnifying-glass"
            className="absolute top-3 left-3.5 h-4 w-4 fa-solid text-gray-500"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full box-border pl-10 pr-4 border-none bg-primary "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="date"
          placeholder="dd/mm/yyyy"
          className="w-full border-none px-2 rounded bg-primary grid place-content-center"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select
          className="w-full border-none p-2 rounded bg-primary text-sm"
          value={filterInsuranceProgram}
          onChange={(e) => setFilterInsuranceProgram(e.target.value)}
        >
          <option value="">Filter by Insurance Program</option>
          <option value="ContinuousCoverage">Continuous Coverage</option>
          <option value="ORP">ORP</option>
          <option value="SLI">SLI</option>
        </select>
        <select
          className="w-full border-none p-2 rounded bg-primary text-sm"
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
          className="w-full border-none p-2 rounded bg-primary text-sm"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">Filter by Source</option>
          <option value="OnBoarding">On Boarding</option>
          <option value="CAVF">CAVF</option>
        </select>
      </div>
      <div className="flex justify-between items-center mb-4 gap-x-2">
        <button
          className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
        <button
          className="font-normal text-sm bg-primary py-2 px-4 rounded-full mr-auto hover:bg-primary-hover transition-all duration-200 shadow-md"
          onClick={collapseAllRows}
        >
          Collapse all rows
        </button>
        <div className="flex gap-x-2">
          <button
            className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
            onClick={approveSelectedRows}
          >
            Approve selected
          </button>
          <button
            className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
            onClick={rejectSelectedRows}
          >
            Reject selected
          </button>
          <button
            className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
            onClick={requestMoreInfoSelectedRows}
          >
            Request more info
          </button>
        </div>
      </div>
      <table className="table-auto transition-all duration-200 bg-primary w-full rounded-lg text-xs overflow-hidden">
        <thead>
          <tr>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal w-2">
              <input
                type="checkbox"
                className="cursor-pointer"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const newRowSelection = isChecked
                    ? new Set(data.map((row) => row.id))
                    : new Set();
                  setSelectedRows(newRowSelection);
                }}
              />
            </th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">CREATED</th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">STATUS</th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">BUSINESS</th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal" >CONTACT</th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">PROGRAM</th>
            <th className="p-4 text-start text-primary-dimmed uppercase tracking-widest font-normal">SOURCE</th>
            <th className="p-4 text-end"></th>
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
                  <input
                    className="cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRowSelection(String(row.id), e.target.checked);
                    }}
                  />
                </td>
                <td className="px-4 py-2">{row.createdDate.toDateString()}</td>
                <td className={`px-4 py-2 ${updatedRowIds.has(String(row.id)) ? "bg-briefly-changed" : ""}`}>
                  {row.status}
                </td>

                <td className="px-4 py-2">{row.businessName}</td>
                <td className="px-4 py-2">{row.contactName}</td>
                <td className="px-4 py-2">{row.insuranceProgram}</td>
                <td className="px-4 py-2">{row.source}</td>
                <td className="px-4 py-2" onClick={() => toggleRowExpanded(String(row.id))}>
                  <div className={`grid place-content-center cursor-pointer text-primary-dimmed hover:text-primary transition-all duration-300 ${expandedRows.has(row.id) ? 'transform -rotate-180 text-primary' : ''}`}>
                    <Icon
                      icon="chevron-down solid"
                      size={ICON_SIZES.XXL}
                    />
                  </div>
                </td>
                <td className="px-4 py-2" onClick={() => navigateToApplicantDetailPage(row)}>
                  <Icon
                    icon="arrow-right-to-line solid"
                    className="cursor-pointer mr-1 text-primary-dimmed hover:text-primary"
                    size={2}
                  />
                </td>
              </tr>
              {expandedRows.has(row.id) && (
                <tr>
                  <td colSpan={10} className="p-4">
                    <div
                      className="overflow-hidden p-2 flex flex-row"
                      style={{ maxHeight: expandedRows.has(row.id) ? "10rem" : "0" }}
                    >
                      <div><p>
                        Business Name: <strong>{row.businessName}</strong>
                      </p>
                        <p>
                          Contact Email: <strong>{row.contactEmail}</strong>
                        </p>
                        <p>
                          Contact Phone: <strong>{row.contactPhone}</strong>
                        </p>
                        <button
                          className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md mt-1 mr-2"
                          onClick={() => { updateApplicationStatus(String(row.id), "Approved") }}
                        >
                          Approve
                        </button>
                        <button
                          className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md mr-2"
                          onClick={() => { updateApplicationStatus(String(row.id), "Rejected") }}
                        >
                          Reject
                        </button>
                        <button
                          className="font-normal text-sm bg-primary py-2 px-4 rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md"
                          onClick={() => { updateApplicationStatus(String(row.id), "Incomplete") }}
                        >
                          Request More Info
                        </button></div>
                      <div>

                        <p>Documents:</p>
                      </div>

                    </div>

                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {/* empty row */}
          {data.length == 0 &&
            Array.from({ length: displayedRowCount - data.length }, (_, i) => (
              <tr
                key={`empty-row-${i}`}
                className="table-row w-full font-normal overflow-hidden relative"
              >
              </tr>
            ))}
        </tbody>
        {
          data.length > displayedRowCount && (
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
          )
        }
      </table>
    </div>
  );
};

export default Table;
