import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getAllForApproval, updateApprovalStatus } from "../../../services/internship.service";
import { DataTable } from "../../../components/DataTable";
import Sidebar from "../../../components/Sidebar";
import type { ColumnDef } from "@tanstack/react-table";
import { FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";

interface Internship {
	internship_id: number;
	title: string;
	description: string;
	approval_status: "pending" | "approved" | "rejected";
	is_hiring: boolean;
	status: string;
	createdAt: string;
	employer: {
		employer_id: number;
		company_name: string;
		contact_person: string;
		contact_email: string;
		contact_phone: string;
		company_overview: string;
		user: {
			email: string;
			profile_picture: string | null;
		};
	};
}

const InternshipApprovalTab = () => {
	const [loading, setLoading] = useState(true);
	const [internships, setInternships] = useState<Internship[]>([]);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [showCompanySidebar, setShowCompanySidebar] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<Internship["employer"] | null>(null);

	const fetchInternships = async () => {
		setLoading(true);
		try {
			const data = await getAllForApproval();
			setInternships(data);
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to load internships",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInternships();
	}, []);

	const handleApproval = async (internshipId: number, status: "approved" | "rejected" | "pending") => {
		try {
			await updateApprovalStatus(internshipId, status);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: `Internship status updated to ${status} successfully`,
				timer: 2000,
				showConfirmButton: false,
			});
			fetchInternships();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to update approval status",
			});
		}
	};

	const handleViewCompany = (internship: Internship) => {
		if (internship.employer) {
			setSelectedCompany(internship.employer);
			setShowCompanySidebar(true);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusColors: Record<string, string> = {
			pending: "bg-yellow-100 text-yellow-800",
			approved: "bg-green-100 text-green-800",
			rejected: "bg-red-100 text-red-800",
		};

		return (
			<span
				className={`px-2 py-1 rounded-full text-xs font-semibold ${
					statusColors[status] || "bg-gray-100 text-gray-800"
				}`}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	const filteredInternships = internships.filter((internship) => {
		if (filterStatus === "all") return true;
		return internship.approval_status === filterStatus;
	});

	const columns: ColumnDef<Internship>[] = [
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => (
				<div>
					<div className="font-semibold text-gray-900">{row.original.title}</div>
					<div
						className="text-sm text-gray-500 mt-1 prose prose-sm max-w-none line-clamp-2"
						style={{ maxHeight: "60px", overflow: "hidden" }}
						dangerouslySetInnerHTML={{
							__html: row.original.description || "",
						}}
					/>
				</div>
			),
		},
		{
			accessorKey: "employer.company_name",
			header: "Company",
			cell: ({ row }) => (
				<div>
					<div className="font-medium text-gray-900">
						{row.original.employer?.company_name || "N/A"}
					</div>
					<div className="text-sm text-gray-500">
						{row.original.employer?.contact_person || ""}
					</div>
					<div className="text-sm text-gray-500">
						{row.original.employer?.contact_email || ""}
					</div>
				</div>
			),
		},
		{
			accessorKey: "approval_status",
			header: "Status",
			cell: ({ row }) => getStatusBadge(row.original.approval_status),
		},
		{
			accessorKey: "is_hiring",
			header: "Hiring",
			cell: ({ row }) => (
				<span
					className={`px-2 py-1 rounded-full text-xs font-semibold ${
						row.original.is_hiring
							? "bg-blue-100 text-blue-800"
							: "bg-gray-100 text-gray-800"
					}`}>
					{row.original.is_hiring ? "Yes" : "No"}
				</span>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Posted",
			cell: ({ row }) => {
				const date = new Date(row.original.createdAt);
				return <span className="text-sm text-gray-600">{date.toLocaleDateString()}</span>;
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const internship = row.original;
				return (
					<div className="flex items-center gap-2">
						<button
							onClick={() => handleViewCompany(internship)}
							className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
							title="View Company">
							<MdBusiness size={18} />
						</button>
						{internship.approval_status === "pending" && (
							<>
								<button
									onClick={() => handleApproval(internship.internship_id, "approved")}
									className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
									title="Approve">
									<FiCheck size={18} />
								</button>
								<button
									onClick={() => handleApproval(internship.internship_id, "rejected")}
									className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
									title="Reject">
									<FiX size={18} />
								</button>
							</>
						)}
						{(internship.approval_status === "approved" ||
							internship.approval_status === "rejected") && (
							<button
								onClick={() => handleApproval(internship.internship_id, "pending")}
								className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
								title="Reset to Pending">
								<FiRefreshCw size={18} />
							</button>
						)}
					</div>
				);
			},
		},
	];

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl poppins-semibold text-gray-800">
					Internship Approvals
				</h2>
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
					<option value="all">All Statuses</option>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="rejected">Rejected</option>
				</select>
			</div>

			<div className="bg-white rounded-lg shadow-md">
				<DataTable
					data={filteredInternships}
					columns={columns}
					headerBgColor="bg-green-600"
				/>
			</div>

			{filteredInternships.length === 0 && !loading && (
				<div className="text-center py-10 text-gray-500">
					No internships found
				</div>
			)}

			{/* Company Details Sidebar */}
			<Sidebar
				isOpen={showCompanySidebar}
				onClose={() => {
					setShowCompanySidebar(false);
					setSelectedCompany(null);
				}}
				title="Company Details">
				{selectedCompany && (
					<div className="space-y-6">
						{/* Company Header */}
						<div className="flex items-center gap-4 pb-4 border-b">
							<div className="w-20 h-20 rounded-full border-4 border-green-500 overflow-hidden bg-gray-200 flex items-center justify-center">
								{selectedCompany.user?.profile_picture ? (
									<img
										src={selectedCompany.user.profile_picture}
										alt="Company Logo"
										className="w-full h-full object-cover"
									/>
								) : (
									<svg
										className="w-12 h-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								)}
							</div>
							<div>
								<h3 className="text-2xl poppins-bold text-gray-800">
									{selectedCompany.company_name}
								</h3>
								<p className="text-gray-600 poppins-regular">
									{selectedCompany.user?.email || "N/A"}
								</p>
							</div>
						</div>

						{/* Company Information */}
						<div className="space-y-4">
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Contact Person
								</label>
								<p className="text-gray-800 poppins-regular">
									{selectedCompany.contact_person || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Email</label>
								<p className="text-gray-800 poppins-regular">
									{selectedCompany.contact_email || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Phone</label>
								<p className="text-gray-800 poppins-regular">
									{selectedCompany.contact_phone || "N/A"}
								</p>
							</div>

							{selectedCompany.company_overview && (
								<div>
									<label className="text-sm font-semibold text-gray-600 block mb-1">
										Company Overview
									</label>
									<div
										className="text-gray-800 poppins-regular leading-relaxed prose max-w-none"
										dangerouslySetInnerHTML={{ __html: selectedCompany.company_overview }}
									/>
								</div>
							)}
						</div>
					</div>
				)}
			</Sidebar>
		</div>
	);
};

export default InternshipApprovalTab;

