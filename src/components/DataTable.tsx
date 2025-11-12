import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	flexRender,
} from "@tanstack/react-table";
import type {
	ColumnDef,
	SortingState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	headerBgColor?: string;
	enablePagination?: boolean;
	pageSize?: number;
	enableSorting?: boolean;
	enableFiltering?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading = false,
	headerBgColor = "bg-green-500",
	enablePagination = true,
	pageSize = 10,
	enableSorting = true,
	enableFiltering = false,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
		getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
		getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		initialState: {
			pagination: {
				pageSize: pageSize,
			},
		},
		state: {
			sorting,
			columnFilters,
		},
	});

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<p className="text-gray-500 poppins-regular">Loading...</p>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				No data found.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
				<table className="min-w-full border-collapse text-sm">
					<thead
						className={`${headerBgColor} ${
							headerBgColor === "bg-gray-100" ? "text-gray-800" : "text-white"
						} poppins-semibold`}>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={`px-4 py-3 text-left ${
											header.column.getCanSort() && enableSorting
												? "cursor-pointer select-none hover:bg-opacity-80"
												: ""
										}`}
										onClick={
											header.column.getToggleSortingHandler() || undefined
										}>
										<div className="flex items-center gap-2">
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{enableSorting && header.column.getCanSort() && (
												<span>
													{header.column.getIsSorted() === "asc"
														? " ↑"
														: header.column.getIsSorted() === "desc"
														? " ↓"
														: " ⇅"}
												</span>
											)}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
						{table.getRowModel().rows.map((row, index) => (
							<tr
								key={row.id}
								className={`${
									index % 2 === 0 ? "bg-gray-50" : "bg-white"
								} hover:bg-blue-50 transition-colors border-b`}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-3">
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
			</div>

			{enablePagination && (
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-2">
						<button
							className="px-3 py-1 border rounded hover:bg-gray-100 poppins-medium disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}>
							{"<<"}
						</button>
						<button
							className="px-3 py-1 border rounded hover:bg-gray-100 poppins-medium disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							Previous
						</button>
						<button
							className="px-3 py-1 border rounded hover:bg-gray-100 poppins-medium disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							Next
						</button>
						<button
							className="px-3 py-1 border rounded hover:bg-gray-100 poppins-medium disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}>
							{">>"}
						</button>
					</div>
					<div className="flex items-center gap-2 poppins-regular">
						<span className="text-sm text-gray-700">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</span>
						<select
							className="px-2 py-1 border rounded text-sm"
							value={table.getState().pagination.pageSize}
							onChange={(e) => {
								table.setPageSize(Number(e.target.value));
							}}>
							{[10, 20, 30, 50, 100].map((pageSize) => (
								<option key={pageSize} value={pageSize}>
									Show {pageSize}
								</option>
							))}
						</select>
					</div>
					<div className="text-sm text-gray-700 poppins-regular">
						Total: {data.length} items
					</div>
				</div>
			)}
		</div>
	);
}

