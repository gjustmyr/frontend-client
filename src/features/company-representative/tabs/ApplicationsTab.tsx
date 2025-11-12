import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMyInternships } from "../../../services/internship.service";
import { getApplications, updateApplicationStatus } from "../../../services/internship.service";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/DataTable";

interface Application {
	student_internship_id: number;
	status: string;
	student_trainee: {
		student_trainee_id: number;
		first_name: string;
		middle_name?: string;
		last_name: string;
		prefix_name?: string;
		suffix_name?: string;
		user?: {
			email: string;
		};
	};
	supervisor: {
		supervisor_id: number;
		first_name: string;
		last_name: string;
	};
	createdAt: string;
}

const ApplicationsTab = () => {
	const [internships, setInternships] = useState<any[]>([]);
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedInternship, setSelectedInternship] = useState<number | null>(null);
	const [selectedStudent, setSelectedStudent] = useState<Application | null>(null);
	const [showStudentModal, setShowStudentModal] = useState(false);

	const fetchInternships = async () => {
		try {
			const data = await getMyInternships();
			const internshipsOnly = (data || []).filter((item: any) => !item.is_hiring);
			setInternships(internshipsOnly);
			if (internshipsOnly.length > 0) {
				if (!selectedInternship || !internshipsOnly.some((item) => item.internship_id === selectedInternship)) {
					setSelectedInternship(internshipsOnly[0].internship_id);
				}
			} else {
				setSelectedInternship(null);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const fetchApplications = async () => {
		if (!selectedInternship) {
			setApplications([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const data = await getApplications(selectedInternship);
			// Filter out applications without supervisor (they might not be assigned yet)
			const filteredData = data.filter((app: any) => app.supervisor);
			setApplications(filteredData);
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Failed to load applications",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInternships();
	}, []);

	useEffect(() => {
		fetchApplications();
	}, [selectedInternship]);

	const getFullName = (student: Application["student_trainee"]) => {
		const parts = [
			student.prefix_name,
			student.first_name,
			student.middle_name,
			student.last_name,
			student.suffix_name,
		].filter(Boolean);
		return parts.join(" ");
	};

	const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
		try {
			await updateApplicationStatus(applicationId, newStatus);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Application status updated",
				timer: 1500,
				showConfirmButton: false,
			});
			fetchApplications();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to update status",
			});
		}
	};

	const columns: ColumnDef<Application>[] = [
		{
			accessorKey: "student_name",
			header: "Student Name",
			cell: ({ row }) => {
				return (
					<button
						onClick={() => {
							setSelectedStudent(row.original);
							setShowStudentModal(true);
						}}
						className="text-blue-600 hover:underline poppins-medium">
						{getFullName(row.original.student_trainee)}
					</button>
				);
			},
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => {
				return row.original.student_trainee.user?.email || "N/A";
			},
		},
		{
			accessorKey: "supervisor",
			header: "Supervisor",
			cell: ({ row }) => {
				return `${row.original.supervisor?.first_name || ""} ${
					row.original.supervisor?.last_name || ""
				}`.trim() || "N/A";
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status;
				const statusColors: Record<string, string> = {
					application_seen: "bg-blue-100 text-blue-700",
					hired: "bg-green-100 text-green-700",
					starting: "bg-purple-100 text-purple-700",
					"pre-ojt": "bg-yellow-100 text-yellow-700",
					ongoing: "bg-blue-100 text-blue-700",
					completed: "bg-green-100 text-green-700",
					dropped: "bg-red-100 text-red-700",
				};

				return (
					<div className="text-center">
						<span
							className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
								statusColors[status] || "bg-gray-100 text-gray-700"
							}`}>
							{status.replace("_", " ")}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const currentStatus = row.original.status;
				return (
					<div className="flex gap-2">
						<select
							className="px-2 py-1 border rounded text-sm"
							value={currentStatus}
							onChange={(e) =>
								handleStatusUpdate(
									row.original.student_internship_id,
									e.target.value
								)
							}>
							<option value="application_seen">Application Seen</option>
							<option value="hired">Hired</option>
							<option value="starting">Starting</option>
							<option value="pre-ojt">Pre-OJT</option>
							<option value="ongoing">Ongoing</option>
							<option value="completed">Completed</option>
							<option value="dropped">Dropped</option>
						</select>
					</div>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: "Applied Date",
			cell: ({ row }) => {
				return new Date(row.original.createdAt).toLocaleDateString();
			},
		},
	];

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-4">Applications Management</h2>

			{internships.length > 0 && (
				<div className="mb-4">
					<label className="block text-sm font-medium mb-2">
						Select Internship
					</label>
					<select
						className="p-2 border rounded w-full md:w-1/3"
						value={selectedInternship || ""}
						onChange={(e) => setSelectedInternship(Number(e.target.value))}>
						<option value="">Select an internship</option>
						{internships.map((internship) => (
							<option key={internship.internship_id} value={internship.internship_id}>
								{internship.title}
							</option>
						))}
					</select>
				</div>
			)}

			{selectedInternship ? (
				<DataTable columns={columns} data={applications} loading={loading} />
			) : (
				<div className="text-center py-10 text-gray-500">
					{internships.length === 0
						? "No internships posted yet. Post an internship first."
						: "Please select an internship to view applications."}
				</div>
			)}

			{/* Student Details Modal */}
			{showStudentModal && selectedStudent && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl poppins-semibold">Student Details</h3>
							<button
								onClick={() => {
									setShowStudentModal(false);
									setSelectedStudent(null);
								}}
								className="text-gray-500 hover:text-gray-700 text-2xl">
								×
							</button>
						</div>

						<div className="space-y-3">
							<div>
								<label className="text-sm font-medium text-gray-600">
									Full Name
								</label>
								<p className="poppins-regular">
									{getFullName(selectedStudent.student_trainee)}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-gray-600">Email</label>
								<p className="poppins-regular">
									{selectedStudent.student_trainee.user?.email || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-gray-600">
									Supervisor
								</label>
								<p className="poppins-regular">
									{selectedStudent.supervisor
										? `${selectedStudent.supervisor.first_name} ${selectedStudent.supervisor.last_name}`
										: "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-gray-600">
									Current Status
								</label>
								<p className="poppins-regular">
									<span
										className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
											selectedStudent.status === "application_seen"
												? "bg-blue-100 text-blue-700"
												: selectedStudent.status === "hired"
												? "bg-green-100 text-green-700"
												: selectedStudent.status === "starting"
												? "bg-purple-100 text-purple-700"
												: "bg-gray-100 text-gray-700"
										}`}>
										{selectedStudent.status.replace("_", " ")}
									</span>
								</p>
							</div>

							<div>
								<label className="text-sm font-medium text-gray-600">
									Applied Date
								</label>
								<p className="poppins-regular">
									{new Date(selectedStudent.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								onClick={() => {
									setShowStudentModal(false);
									setSelectedStudent(null);
								}}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 poppins-medium">
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ApplicationsTab;

