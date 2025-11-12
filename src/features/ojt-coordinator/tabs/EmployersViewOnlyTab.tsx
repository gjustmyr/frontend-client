import { useState, useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getIndustries } from "../../../services/dropdown.service";
import { getEmployers } from "../../../services/employee.service";
import { DataTable } from "../../../components/DataTable";

interface Employer {
	employer_id: number;
	company_name: string;
	industry_id: number;
	contact_email: string;
	status: string;
	moas?: Array<{
		document_url: string;
		signed_date: string;
		expiration_date: string;
	}>;
}

const EmployersViewOnlyTab = () => {
	const [employers, setEmployers] = useState<Employer[]>([]);
	const [industries, setIndustries] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch employers
	const fetchEmployers = async () => {
		setLoading(true);
		try {
			const data = await getEmployers();
			setEmployers(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch industries
	const fetchIndustries = async () => {
		try {
			const data = await getIndustries();
			setIndustries(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchEmployers();
		fetchIndustries();
	}, []);

	const columns: ColumnDef<Employer>[] = useMemo(
		() => [
			{
				accessorKey: "company_name",
				header: "Company Name",
			},
			{
				accessorKey: "industry_id",
				header: "Industry",
				cell: ({ row }) => {
					const industry = industries.find(
						(i: any) => i.industry_id === row.original.industry_id
					);
					return industry?.industry_name || "N/A";
				},
			},
			{
				accessorKey: "contact_email",
				header: "Email",
				cell: ({ row }) => {
					return row.original.contact_email || "N/A";
				},
			},
			{
				accessorKey: "moa_document",
				header: "MOA Document",
				cell: ({ row }) => {
					const moa = row.original.moas?.[0];
					return moa ? (
						<a
							href={moa.document_url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline">
							Open MOA
						</a>
					) : (
						"N/A"
					);
				},
			},
			{
				accessorKey: "signed_date",
				header: "Signed Date",
				cell: ({ row }) => {
					return row.original.moas?.[0]?.signed_date?.split("T")[0] || "N/A";
				},
			},
			{
				accessorKey: "expiration_date",
				header: "Expiration Date",
				cell: ({ row }) => {
					return row.original.moas?.[0]?.expiration_date?.split("T")[0] || "N/A";
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.original.status;
					const displayStatus = status === "enabled" ? "Published" : "Archived";
					return (
						<div className="text-center">
							<span
								className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
									status === "enabled"
										? "bg-green-100 text-green-700"
										: "bg-red-100 text-red-700"
								}`}>
								{displayStatus}
							</span>
						</div>
					);
				},
			},
		],
		[industries]
	);

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">Employers (View Only)</h2>
			<DataTable columns={columns} data={employers} loading={loading} />
		</div>
	);
};

export default EmployersViewOnlyTab;

