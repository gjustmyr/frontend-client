import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import type { ColumnDef } from "@tanstack/react-table";
import { getOJTRequirements } from "../../../services/ojt-requirement.service";
import { DataTable } from "../../../components/DataTable";

interface Requirement {
	ojt_requirement_id: number;
	requirement_name: string;
	type: string;
	status: string;
	document_url: string;
}

const OJTRequirementsViewOnlyTab = () => {
	const [requirements, setRequirements] = useState<Requirement[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");

	const fetchRequirements = async () => {
		setLoading(true);
		try {
			const data = await getOJTRequirements();
			setRequirements(data);
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Failed to fetch requirements",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRequirements();
	}, []);

	// Filter by search + type
	const filteredRequirements = useMemo(() => {
		return requirements.filter((req) => {
			const matchesSearch = req.requirement_name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesType = filterType === "all" || req.type === filterType;
			return matchesSearch && matchesType;
		});
	}, [requirements, searchTerm, filterType]);

	const columns: ColumnDef<Requirement>[] = [
		{
			accessorKey: "requirement_name",
			header: "Requirement",
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				return row.original.type === "pre-ojt" ? "Pre-OJT" : "Post-OJT";
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<div className="text-center">
						<span
							className={`px-2 py-1 text-xs rounded-full ${
								status === "active"
									? "bg-green-100 text-green-700"
									: status === "expired"
									? "bg-yellow-100 text-yellow-700"
									: "bg-red-100 text-red-700"
							}`}>
							{status}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "document_url",
			header: "Document",
			cell: ({ row }) => {
				return (
					<div className="text-center">
						<a
							href={row.original.document_url}
							target="_blank"
							rel="noreferrer"
							className="text-blue-600 hover:underline">
							View PDF
						</a>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">OJT Requirements (View Only)</h2>

			{/* Search + Type Filter */}
			<div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-4 space-y-2 md:space-y-0">
				<input
					type="text"
					placeholder="Search by requirement name..."
					className="p-2 border rounded w-full md:w-1/3"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<select
					className="p-2 border rounded w-full md:w-1/4"
					value={filterType}
					onChange={(e) => setFilterType(e.target.value)}>
					<option value="all">All Types</option>
					<option value="pre-ojt">Pre-OJT</option>
					<option value="post-ojt">Post-OJT</option>
				</select>
			</div>

			<DataTable
				columns={columns}
				data={filteredRequirements}
				loading={loading}
			/>
		</div>
	);
};

export default OJTRequirementsViewOnlyTab;

