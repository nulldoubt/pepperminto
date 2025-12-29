import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import Loader from "react-spinners/ClipLoader";
import { useRouter } from "next/router";

// import MarkdownPreview from "../MarkdownPreview";
import TicketsMobileList from "../../components/TicketsMobileList";

function DefaultColumnFilter({ column }) {
  return (
    <input
      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      type="text"
      value={column.getFilterValue() || ""}
      onChange={(e) => {
        column.setFilterValue(e.target.value || undefined);
      }}
      placeholder="Type to filter"
    />
  );
}

function Table({ columns, data }) {
  const [columnFilters, setColumnFilters] = React.useState([]);
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    filterFns: {
      startsWith: (row, columnId, value) => {
        const rowValue = row.getValue(columnId);
        return rowValue !== undefined
          ? String(rowValue)
              .toLowerCase()
              .startsWith(String(value).toLowerCase())
          : true;
      },
    },
    defaultColumn: {
      filterFn: "startsWith",
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  return (
    <div className="overflow-x-auto md:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full md:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const hideHeader = header.column.columnDef.hideHeader === false;
                    if (hideHeader) {
                      return null;
                    }
                    return (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        <div>
                          {header.column.getCanFilter() ? (
                            <DefaultColumnFilter column={header.column} />
                          ) : null}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-white">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <div className="flex flex-row flex-nowrap w-full space-x-2">
                <p
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mt-4"
                >
                  Show
                </p>
                <select
                  id="location"
                  name="location"
                  className="block w-full pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                  >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
                <button
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function AssignedTickets() {
  const router = useRouter();
  async function getUserTickets() {
    const res = await fetch(
      `/api/v1/ticket/emailQueue?name=${router.query.id}`
    );
    return res.json();
  }

  const { data, isSuccess } = useQuery({
    queryKey: ["userTickets"],
    queryFn: getUserTickets,
  });

  const high = "bg-red-100 text-red-800";
  const low = "bg-blue-100 text-blue-800";
  const normal = "bg-green-100 text-green-800";

  const columns = React.useMemo(() => [
    {
      header: "No.",
      accessorKey: "Number",
      id: "number",
    },
    {
      header: "Name",
      accessorKey: "name",
      id: "name",
    },
    {
      header: "Client",
      id: "client_name",
      accessorFn: (row) => row?.client?.name,
    },
    {
      header: "Priority",
      accessorKey: "priority",
      id: "priority",
      cell: ({ getValue }) => {
        const value = getValue();
        let badge;

        if (value === "Low") {
          badge = low;
        }
        if (value === "Normal") {
          badge = normal;
        }
        if (value === "High") {
          badge = high;
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      header: "Title",
      accessorKey: "title",
      id: "Title",
      cell: ({ getValue }) => {
        return <div className="truncate">{getValue()}</div>;
      },
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => {
        return <Link href={`/tickets/${row.original.id}`}>View</Link>;
      },
    },
  ]);

  return (
    <>
      {isSuccess && (
        <>
          {data.tickets && (
            <>
              <div className="hidden sm:block">
                <Table columns={columns} data={data.tickets} />
              </div>

              <div className="sm:hidden">
                <TicketsMobileList tickets={data.tickets} />
              </div>
            </>
          )}

          {data.tickets.length === 0 && (
            <>
              <div className="text-center mt-72">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  You currently don't have any assigned tickets. :)
                </h3>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
