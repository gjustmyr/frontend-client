import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import type { ColumnDef } from "@tanstack/react-table";
import { getStudentsBySection, addStudentsToSection, addStudentsFromExcel } from "../../../services/ojt-coordinator.service";
import { getStudentRequirements, reviewRequirement, type StudentRequirementsData, type StudentRequirement } from "../../../services/student-requirement.service";
import { DataTable } from "../../../components/DataTable";
import Modal from "../../../components/Modal";
import { FiPlus, FiX, FiUpload, FiFile, FiEye, FiCheck, FiXCircle, FiFileText } from "react-icons/fi";

interface Student {
	student_internship_id: number;
	student_trainee_id: number;
	first_name: string;
	middle_name?: string;
	last_name: string;
	prefix_name?: string;
	suffix_name?: string;
	status: string;
}

interface SectionData {
	section_id: number;
	section_name: string;
	academic_year: string;
	semestral: string;
	students: Student[];
}

interface StudentFormData {
	first_name: string;
	last_name: string;
	middle_name: string;
	prefix_name: string;
	suffix_name: string;
	email: string;
	sex: "male" | "female";
	civil_status: "single" | "married" | "widowed" | "separated";
}

const ClassListingTab = () => {
	const [sections, setSections] = useState<SectionData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterAcademicYear, setFilterAcademicYear] = useState<string>("all");
	const [filterSemestral, setFilterSemestral] = useState<string>("all");
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
	const [students, setStudents] = useState<StudentFormData[]>([
		{
			first_name: "",
			last_name: "",
			middle_name: "",
			prefix_name: "",
			suffix_name: "",
			email: "",
			sex: "male",
			civil_status: "single",
		},
	]);
	const [submitting, setSubmitting] = useState(false);
	const [uploadMode, setUploadMode] = useState<"manual" | "excel">("manual");
	const [excelFile, setExcelFile] = useState<File | null>(null);
	
	// Requirements modal state
	const [showRequirementsModal, setShowRequirementsModal] = useState(false);
	const [selectedStudentInternship, setSelectedStudentInternship] = useState<number | null>(null);
	const [studentRequirementsData, setStudentRequirementsData] = useState<StudentRequirementsData | null>(null);
	const [reviewRemarks, setReviewRemarks] = useState("");
	const [reviewLoading, setReviewLoading] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [selectedRequirement, setSelectedRequirement] = useState<StudentRequirement | null>(null);
	const [selectedStudentName, setSelectedStudentName] = useState("");
	const [loadingRequirements, setLoadingRequirements] = useState(false);

	const fetchStudents = async () => {
		setLoading(true);
		try {
			const data = await getStudentsBySection();
			console.log("Sections data received:", data); // Debug log
			setSections(Array.isArray(data) ? data : []);
		} catch (err: any) {
			console.error("Error fetching sections:", err);
			const errorMessage = err?.response?.data?.message || err?.message || "Failed to load student data";
			Swal.fire({
				icon: "error",
				title: "Error",
				text: errorMessage,
			});
			setSections([]); // Set empty array on error
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStudents();
	}, []);

	// Get unique academic years and semestrals from sections
	const academicYears = Array.from(
		new Set(sections.map((section) => section.academic_year))
	).sort();

	const semestrals = Array.from(
		new Set(sections.map((section) => section.semestral))
	).sort();

	// Filter sections and students by search term, academic year, and semestral
	const filteredSections = sections
		.filter((section) => {
			const matchesAcademicYear =
				filterAcademicYear === "all" || section.academic_year === filterAcademicYear;
			const matchesSemestral =
				filterSemestral === "all" || section.semestral === filterSemestral;
			return matchesAcademicYear && matchesSemestral;
		})
		.map((section) => ({
			...section,
			students: section.students.filter((student) => {
				const fullName = `${student.prefix_name || ""} ${student.first_name} ${
					student.middle_name || ""
				} ${student.last_name} ${student.suffix_name || ""}`
					.toLowerCase()
					.replace(/\s+/g, " ");
				return (
					fullName.includes(searchTerm.toLowerCase()) ||
					section.section_name.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}),
		}))
		.filter((section) => {
			// Always show sections (even if no students), but filter by search term if provided
			if (searchTerm.trim() === "") {
				return true; // Show all sections when no search term
			}
			// Show section if section name matches search OR if it has students that match
			return section.section_name.toLowerCase().includes(searchTerm.toLowerCase());
		});

	const getFullName = (student: Student) => {
		const parts = [
			student.prefix_name,
			student.first_name,
			student.middle_name,
			student.last_name,
			student.suffix_name,
		].filter(Boolean);
		return parts.join(" ");
	};

	const handleAddStudents = (section: SectionData) => {
		setSelectedSection(section);
		setStudents([
			{
				first_name: "",
				last_name: "",
				middle_name: "",
				prefix_name: "",
				suffix_name: "",
				email: "",
				sex: "male",
				civil_status: "single",
			},
		]);
		setShowAddModal(true);
	};

	const handleAddStudentRow = () => {
		setStudents([
			...students,
			{
				first_name: "",
				last_name: "",
				middle_name: "",
				prefix_name: "",
				suffix_name: "",
				email: "",
				sex: "male",
				civil_status: "single",
			},
		]);
	};

	const handleRemoveStudentRow = (index: number) => {
		setStudents(students.filter((_, i) => i !== index));
	};

	const handleStudentChange = (index: number, field: keyof StudentFormData, value: string) => {
		const updated = [...students];
		updated[index] = { ...updated[index], [field]: value };
		setStudents(updated);
	};

	const handleSubmitStudents = async () => {
		if (!selectedSection) return;

		// Excel upload mode
		if (uploadMode === "excel") {
			if (!excelFile) {
				Swal.fire({
					icon: "error",
					title: "Error",
					text: "Please select an Excel file to upload",
				});
				return;
			}

			setSubmitting(true);
			try {
				const response = await addStudentsFromExcel({
					section_id: selectedSection.section_id,
					academic_year: selectedSection.academic_year,
					semestral: selectedSection.semestral,
					excel_file: excelFile,
				});

				const createdCount = response.data?.created?.length || 0;
				const errorCount = response.data?.errors?.length || 0;
				const totalRows = response.data?.total_rows || 0;

				if (errorCount > 0) {
					Swal.fire({
						icon: "warning",
						title: "Partial Success",
						html: `
							<p>Successfully created ${createdCount} student(s) out of ${totalRows} total rows</p>
							<p>Failed to create ${errorCount} student(s)</p>
							<div style="max-height: 300px; overflow-y: auto; text-align: left; margin-top: 10px;">
								${response.data.errors.slice(0, 10).map((e: any) => `<p style="font-size: 12px; margin: 5px 0;">Row ${e.row}: ${e.student} - ${e.error}</p>`).join("")}
								${errorCount > 10 ? `<p style="font-size: 12px; color: #666;">...and ${errorCount - 10} more errors</p>` : ""}
							</div>
						`,
						width: "600px",
					});
				} else {
					Swal.fire({
						icon: "success",
						title: "Success",
						text: `Successfully created ${createdCount} student account(s) from Excel`,
						timer: 2000,
						showConfirmButton: false,
					});
				}

				setShowAddModal(false);
				setSelectedSection(null);
				setExcelFile(null);
				setUploadMode("manual");
				fetchStudents();
			} catch (err: any) {
				console.error(err);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: err.message || "Failed to upload Excel file",
				});
			} finally {
				setSubmitting(false);
			}
			return;
		}

		// Manual entry mode
		// Validate all students have required fields
		const invalidStudents = students.filter(
			(s) => !s.first_name || !s.last_name || !s.email
		);

		if (invalidStudents.length > 0) {
			Swal.fire({
				icon: "error",
				title: "Validation Error",
				text: "Please fill in all required fields (First Name, Last Name, Email) for all students",
			});
			return;
		}

		setSubmitting(true);
		try {
			const response = await addStudentsToSection({
				section_id: selectedSection.section_id,
				academic_year: selectedSection.academic_year,
				semestral: selectedSection.semestral,
				students: students.map((s) => ({
					first_name: s.first_name,
					last_name: s.last_name,
					middle_name: s.middle_name || undefined,
					prefix_name: s.prefix_name || undefined,
					suffix_name: s.suffix_name || undefined,
					email: s.email,
					sex: s.sex,
					civil_status: s.civil_status,
				})),
			});

			const createdCount = response.data?.created?.length || 0;
			const errorCount = response.data?.errors?.length || 0;

			if (errorCount > 0) {
				Swal.fire({
					icon: "warning",
					title: "Partial Success",
					html: `
						<p>Successfully created ${createdCount} student(s)</p>
						<p>Failed to create ${errorCount} student(s)</p>
						${response.data.errors.map((e: any) => `<p class="text-sm">${e.student}: ${e.error}</p>`).join("")}
					`,
				});
			} else {
				Swal.fire({
					icon: "success",
					title: "Success",
					text: `Successfully created ${createdCount} student account(s)`,
					timer: 2000,
					showConfirmButton: false,
				});
			}

			setShowAddModal(false);
			setSelectedSection(null);
			setStudents([
				{
					first_name: "",
					last_name: "",
					middle_name: "",
					prefix_name: "",
					suffix_name: "",
					email: "",
					sex: "male",
					civil_status: "single",
				},
			]);
			fetchStudents();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to create student accounts",
			});
		} finally {
			setSubmitting(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			const validTypes = [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
				"application/vnd.ms-excel", // .xls
			];
			const validExtensions = [".xlsx", ".xls"];
			const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

			if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
				Swal.fire({
					icon: "error",
					title: "Invalid File Type",
					text: "Please upload a valid Excel file (.xlsx or .xls)",
				});
				return;
			}

			setExcelFile(file);
		}
	};

	const handleDownloadTemplate = () => {
		// Create a simple CSV template that can be opened in Excel
		const template = `First Name,Last Name,Middle Name,Prefix Name,Suffix Name,Email,Sex,Civil Status
John,Doe,Michael,Mr.,Jr.,john.doe@example.com,male,single
Jane,Smith,Ann,Ms.,,jane.smith@example.com,female,single`;

		const blob = new Blob([template], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "student_template.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	// Handle view requirements
	const handleViewRequirements = async (studentInternshipId: number, studentName: string) => {
		setSelectedStudentInternship(studentInternshipId);
		setSelectedStudentName(studentName);
		setLoadingRequirements(true);
		setShowRequirementsModal(true);
		
		try {
			const data = await getStudentRequirements(studentInternshipId);
			setStudentRequirementsData(data);
		} catch (error: any) {
			console.error("Error fetching requirements:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load requirements",
			});
		} finally {
			setLoadingRequirements(false);
		}
	};

	// Handle review requirement
	const handleReviewRequirement = (requirement: StudentRequirement) => {
		setSelectedRequirement(requirement);
		setReviewRemarks(requirement.remarks || "");
		setShowReviewModal(true);
	};

	// Handle submit review
	const handleSubmitReview = async (status: "approved" | "need_for_resubmission") => {
		if (!selectedRequirement || !selectedStudentInternship) return;

		setReviewLoading(true);
		try {
			await reviewRequirement(
				selectedRequirement.student_requirement_id!,
				status,
				reviewRemarks
			);
			
			Swal.fire({
				icon: "success",
				title: "Success",
				text: `Requirement ${status === "approved" ? "approved" : "marked for resubmission"}`,
				timer: 2000,
				showConfirmButton: false,
			});

			setShowReviewModal(false);
			setSelectedRequirement(null);
			setReviewRemarks("");

			// Refresh requirements
			if (selectedStudentInternship) {
				const data = await getStudentRequirements(selectedStudentInternship);
				setStudentRequirementsData(data);
			}
		} catch (error: any) {
			console.error("Error reviewing requirement:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to review requirement",
			});
		} finally {
			setReviewLoading(false);
		}
	};

	const studentColumns: ColumnDef<Student>[] = [
		{
			accessorKey: "index",
			header: "#",
			cell: ({ row, table }) => {
				const pageIndex = table.getState().pagination.pageIndex;
				const pageSize = table.getState().pagination.pageSize;
				return pageIndex * pageSize + row.index + 1;
			},
		},
		{
			accessorKey: "name",
			header: "Student Name",
			cell: ({ row }) => {
				return getFullName(row.original);
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
							className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
								status === "ongoing"
									? "bg-blue-100 text-blue-700"
									: status === "completed"
									? "bg-green-100 text-green-700"
									: status === "pre-ojt"
									? "bg-yellow-100 text-yellow-700"
									: status === "post-ojt"
									? "bg-purple-100 text-purple-700"
									: status === "dropped"
									? "bg-red-100 text-red-700"
									: "bg-gray-100 text-gray-700"
							}`}>
							{status}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "actions",
			header: "Actions",
			cell: ({ row }) => {
				return (
					<div className="flex justify-center gap-2">
						<button
							onClick={() => handleViewRequirements(row.original.student_internship_id, getFullName(row.original))}
							className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors poppins-medium flex items-center gap-1">
							<FiEye size={14} />
							View Requirements
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">Class Listing</h2>
			<p className="text-gray-600 poppins-regular mb-4">
				View student trainees assigned to sections
			</p>

			{/* Filters */}
			<div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-3 space-y-2 md:space-y-0">
				<input
					type="text"
					placeholder="Search by section name or student name..."
					className="p-2 border rounded w-full md:w-1/3"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<select
					className="p-2 border rounded w-full md:w-1/4"
					value={filterAcademicYear}
					onChange={(e) => setFilterAcademicYear(e.target.value)}>
					<option value="all">All Academic Years</option>
					{academicYears.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
				<select
					className="p-2 border rounded w-full md:w-1/4"
					value={filterSemestral}
					onChange={(e) => setFilterSemestral(e.target.value)}>
					<option value="all">All Semestrals</option>
					{semestrals.map((semestral) => (
						<option key={semestral} value={semestral}>
							{semestral}
						</option>
					))}
				</select>
			</div>

			{loading ? (
				<div className="flex justify-center py-10 text-gray-500">
					Loading...
				</div>
			) : sections.length === 0 ? (
				<div className="text-center py-10 bg-blue-50 border border-blue-200 rounded-lg p-8">
					<div className="max-w-md mx-auto">
						<FiPlus size={48} className="mx-auto text-blue-400 mb-4" />
						<h3 className="text-lg poppins-semibold text-gray-800 mb-2">
							No Sections Assigned
						</h3>
						<p className="text-gray-600 poppins-regular mb-4">
							You don't have any sections assigned to you yet. 
							Please contact your OJT Head to assign sections to your coordinator account.
						</p>
						<p className="text-sm text-gray-500 poppins-regular">
							Once sections are assigned, you'll be able to add students to those sections here.
						</p>
					</div>
				</div>
			) : filteredSections.length === 0 ? (
				<div className="text-center py-10 text-gray-500">
					<p className="poppins-regular mb-2">No sections match the current filters.</p>
					<p className="text-sm poppins-regular">Try adjusting your search or filter criteria.</p>
				</div>
			) : (
				<div className="space-y-6">
					{filteredSections.map((section) => (
						<div
							key={`${section.section_id}-${section.academic_year}-${section.semestral}`}
							className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
							{/* Section Header */}
							<div className="bg-green-500 text-white px-6 py-4 flex items-center justify-between">
								<div>
									<h3 className="text-lg poppins-semibold">
										{section.section_name}
									</h3>
									<p className="text-sm poppins-regular mt-1">
										{section.academic_year} - {section.semestral}
									</p>
									<p className="text-sm poppins-regular">
										{section.students.length} student
										{section.students.length !== 1 ? "s" : ""}
									</p>
								</div>
								<button
									onClick={() => handleAddStudents(section)}
									className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded hover:bg-green-50 transition-colors poppins-medium shadow-sm">
									<FiPlus size={18} />
									Add Students
								</button>
							</div>

							{/* Students Table */}
							<div className="p-4">
								{section.students.length > 0 ? (
									<DataTable
										columns={studentColumns}
										data={section.students}
										loading={false}
										headerBgColor="bg-gray-100"
										pageSize={10}
									/>
								) : (
									<div className="text-center py-8 text-gray-500">
										<p className="poppins-regular">No students assigned to this section yet.</p>
										<p className="text-sm poppins-regular mt-1">Click "Add Students" to create student accounts.</p>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add Students Modal */}
			{showAddModal && selectedSection && (
				<Modal onClose={() => setShowAddModal(false)} size="xl">
					<div className="space-y-4">
						<h3 className="text-xl poppins-semibold mb-4">
							Add Students to {selectedSection.section_name}
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							{selectedSection.academic_year} - {selectedSection.semestral}
						</p>

						{/* Upload Mode Toggle */}
						<div className="flex gap-2 mb-4 border-b pb-3">
							<button
								type="button"
								onClick={() => {
									setUploadMode("manual");
									setExcelFile(null);
								}}
								className={`px-4 py-2 rounded poppins-medium transition-colors ${
									uploadMode === "manual"
										? "bg-green-500 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								Manual Entry
							</button>
							<button
								type="button"
								onClick={() => {
									setUploadMode("excel");
									setStudents([
										{
											first_name: "",
											last_name: "",
											middle_name: "",
											prefix_name: "",
											suffix_name: "",
											email: "",
											sex: "male",
											civil_status: "single",
										},
									]);
								}}
								className={`px-4 py-2 rounded poppins-medium transition-colors flex items-center gap-2 ${
									uploadMode === "excel"
										? "bg-green-500 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								<FiUpload size={18} />
								Excel Upload
							</button>
						</div>

						{/* Excel Upload Mode */}
						{uploadMode === "excel" && (
							<div className="space-y-4">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<h4 className="text-sm font-semibold mb-2 text-blue-800">
										Excel File Format
									</h4>
									<p className="text-xs text-blue-700 mb-3">
										Your Excel file should have the following columns (in any order):
									</p>
									<ul className="text-xs text-blue-700 list-disc list-inside space-y-1 mb-3">
										<li><strong>First Name</strong> (required)</li>
										<li><strong>Last Name</strong> (required)</li>
										<li><strong>Email</strong> (required)</li>
										<li><strong>Middle Name</strong> (optional)</li>
										<li><strong>Prefix Name</strong> (optional)</li>
										<li><strong>Suffix Name</strong> (optional)</li>
										<li><strong>Sex</strong> (required: male/female)</li>
										<li><strong>Civil Status</strong> (required: single/married/widowed/separated)</li>
									</ul>
									<button
										type="button"
										onClick={handleDownloadTemplate}
										className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1">
										<FiFile size={14} />
										Download Template
									</button>
								</div>

								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
									<input
										type="file"
										accept=".xlsx,.xls"
										onChange={handleFileChange}
										className="hidden"
										id="excel-file-input"
									/>
									<label
										htmlFor="excel-file-input"
										className="cursor-pointer flex flex-col items-center gap-2">
										<FiUpload size={32} className="text-gray-400" />
										<span className="text-sm text-gray-600">
											{excelFile ? excelFile.name : "Click to upload Excel file"}
										</span>
										<span className="text-xs text-gray-500">
											Supported formats: .xlsx, .xls
										</span>
									</label>
									{excelFile && (
										<button
											type="button"
											onClick={() => setExcelFile(null)}
											className="mt-2 text-xs text-red-600 hover:text-red-800 underline">
											Remove file
										</button>
									)}
								</div>
							</div>
						)}

						{/* Manual Entry Mode */}
						{uploadMode === "manual" && (
							<div className="max-h-[60vh] overflow-y-auto">
								<div className="space-y-4">
									{students.map((student, index) => (
									<div
										key={index}
										className="border border-gray-200 rounded-lg p-4 bg-gray-50">
										<div className="flex items-center justify-between mb-3">
											<h4 className="text-sm poppins-semibold text-gray-700">
												Student {index + 1}
											</h4>
											{students.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveStudentRow(index)}
													className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
													<FiX size={18} />
												</button>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											<div>
												<label className="block text-xs font-medium mb-1">
													Prefix
												</label>
												<input
													type="text"
													className="w-full p-2 border rounded text-sm"
													value={student.prefix_name}
													onChange={(e) =>
														handleStudentChange(index, "prefix_name", e.target.value)
													}
													placeholder="Mr., Ms., etc."
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													First Name *
												</label>
												<input
													type="text"
													className="w-full p-2 border rounded text-sm"
													value={student.first_name}
													onChange={(e) =>
														handleStudentChange(index, "first_name", e.target.value)
													}
													required
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Middle Name
												</label>
												<input
													type="text"
													className="w-full p-2 border rounded text-sm"
													value={student.middle_name}
													onChange={(e) =>
														handleStudentChange(index, "middle_name", e.target.value)
													}
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Last Name *
												</label>
												<input
													type="text"
													className="w-full p-2 border rounded text-sm"
													value={student.last_name}
													onChange={(e) =>
														handleStudentChange(index, "last_name", e.target.value)
													}
													required
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Suffix
												</label>
												<input
													type="text"
													className="w-full p-2 border rounded text-sm"
													value={student.suffix_name}
													onChange={(e) =>
														handleStudentChange(index, "suffix_name", e.target.value)
													}
													placeholder="Jr., Sr., etc."
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Email *
												</label>
												<input
													type="email"
													className="w-full p-2 border rounded text-sm"
													value={student.email}
													onChange={(e) =>
														handleStudentChange(index, "email", e.target.value)
													}
													required
												/>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Sex *
												</label>
												<select
													className="w-full p-2 border rounded text-sm"
													value={student.sex}
													onChange={(e) =>
														handleStudentChange(index, "sex", e.target.value as "male" | "female")
													}>
													<option value="male">Male</option>
													<option value="female">Female</option>
												</select>
											</div>
											<div>
												<label className="block text-xs font-medium mb-1">
													Civil Status *
												</label>
												<select
													className="w-full p-2 border rounded text-sm"
													value={student.civil_status}
													onChange={(e) =>
														handleStudentChange(
															index,
															"civil_status",
															e.target.value as "single" | "married" | "widowed" | "separated"
														)
													}>
													<option value="single">Single</option>
													<option value="married">Married</option>
													<option value="widowed">Widowed</option>
													<option value="separated">Separated</option>
												</select>
											</div>
										</div>
									</div>
								))}
								</div>
							</div>
						)}

						<div className="flex items-center justify-between pt-4 border-t">
							{uploadMode === "manual" && (
								<button
									type="button"
									onClick={handleAddStudentRow}
									className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors poppins-medium">
									<FiPlus size={18} />
									Add Another Student
								</button>
							)}
							{uploadMode === "excel" && <div />}
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => {
										setShowAddModal(false);
										setUploadMode("manual");
										setExcelFile(null);
									}}
									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 poppins-medium">
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSubmitStudents}
									disabled={submitting || (uploadMode === "excel" && !excelFile)}
									className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors poppins-medium disabled:opacity-50">
									{submitting 
										? "Processing..." 
										: uploadMode === "excel" 
										? "Upload Excel File" 
										: `Create ${students.length} Account(s)`
									}
								</button>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{/* View Requirements Modal */}
			{showRequirementsModal && selectedStudentInternship && (
				<Modal onClose={() => setShowRequirementsModal(false)} size="xl">
					<div className="space-y-4">
						<h3 className="text-xl poppins-semibold mb-4">
							Requirements - {selectedStudentName}
						</h3>
						{loadingRequirements ? (
							<div className="flex justify-center py-10">
								<div className="text-gray-500 poppins-regular">Loading requirements...</div>
							</div>
						) : studentRequirementsData ? (
							<div className="space-y-4">
								{/* Requirement Type and Status Info */}
								<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<p className="text-sm poppins-regular text-gray-700">
										<strong>Requirement Type:</strong> {studentRequirementsData.requirementType === "pre-ojt" ? "Pre-OJT" : "Post-OJT"}
									</p>
									<p className="text-sm poppins-regular text-gray-700 mt-1">
										<strong>Current Status:</strong> {studentRequirementsData.currentStatus}
									</p>
									{studentRequirementsData.allApproved && (
										<p className="text-sm poppins-semibold text-green-700 mt-2">
											✓ All requirements approved
										</p>
									)}
									{studentRequirementsData.missingRequirements.length > 0 && (
										<div className="mt-2">
											<p className="text-sm poppins-semibold text-yellow-700">
												Missing Requirements:
											</p>
											<ul className="list-disc list-inside text-sm poppins-regular text-yellow-700 mt-1">
												{studentRequirementsData.missingRequirements.map((req, idx) => (
													<li key={idx}>{req.requirement_name}</li>
												))}
											</ul>
										</div>
									)}
								</div>

								{/* Requirements List */}
								<div className="space-y-3">
									{studentRequirementsData.requirements.map((requirement) => (
										<div
											key={requirement.ojt_requirement_id}
											className="p-4 border border-gray-200 rounded-lg">
											<div className="flex items-start justify-between mb-2">
												<div className="flex-1">
													<h4 className="text-base poppins-semibold text-gray-800">
														{requirement.requirement_name}
													</h4>
													<p className="text-xs poppins-regular text-gray-500 mt-1">
														Type: {requirement.type === "pre-ojt" ? "Pre-OJT" : "Post-OJT"}
													</p>
												</div>
												<span
													className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
														requirement.status === "approved"
															? "bg-green-100 text-green-700"
															: requirement.status === "complied"
															? "bg-blue-100 text-blue-700"
															: requirement.status === "need_for_resubmission"
															? "bg-red-100 text-red-700"
															: "bg-gray-100 text-gray-700"
													}`}>
													{requirement.status.replace("_", " ")}
												</span>
											</div>

											{/* Submitted Document */}
											{requirement.submitted_document_url && (
												<div className="mt-3 p-3 bg-gray-50 rounded">
													<p className="text-sm poppins-regular text-gray-600 mb-2">
														Submitted Document:
													</p>
													<a
														href={requirement.submitted_document_url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sm poppins-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
														<FiFileText size={14} />
														View Document
													</a>
												</div>
											)}

											{/* Remarks */}
											{requirement.remarks && (
												<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
													<p className="text-sm poppins-semibold text-yellow-800 mb-1">
														Remarks:
													</p>
													<p className="text-sm poppins-regular text-yellow-700">
														{requirement.remarks}
													</p>
													{requirement.reviewer && (
														<p className="text-xs poppins-regular text-yellow-600 mt-2">
															Reviewed by: {requirement.reviewer.first_name} {requirement.reviewer.last_name}
															{requirement.reviewed_at && (
																<span className="ml-2">
																	on {new Date(requirement.reviewed_at).toLocaleDateString()}
																</span>
															)}
														</p>
													)}
												</div>
											)}

											{/* Reference Document */}
											{requirement.document_url && (
												<div className="mt-3 p-3 bg-blue-50 rounded">
													<p className="text-sm poppins-regular text-gray-600 mb-2">
														Reference Document:
													</p>
													<a
														href={requirement.document_url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-sm poppins-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
														<FiFileText size={14} />
														View Reference
													</a>
												</div>
											)}

											{/* Review Actions */}
											{requirement.status === "complied" || requirement.status === "need_for_resubmission" ? (
												<div className="mt-3 flex gap-2">
													<button
														onClick={() => handleReviewRequirement(requirement)}
														className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors poppins-medium flex items-center gap-2">
														<FiCheck size={16} />
														Review
													</button>
												</div>
											) : requirement.status === "not_complied" ? (
												<div className="mt-3 p-3 bg-gray-50 rounded">
													<p className="text-sm poppins-regular text-gray-600">
														Waiting for student to submit document
													</p>
												</div>
											) : (
												<div className="mt-3 p-3 bg-green-50 rounded">
													<p className="text-sm poppins-regular text-green-700">
														✓ Requirement approved
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="text-center py-10 text-gray-500 poppins-regular">
								No requirements found
							</div>
						)}
					</div>
				</Modal>
			)}

			{/* Review Requirement Modal */}
			{showReviewModal && selectedRequirement && (
				<Modal onClose={() => setShowReviewModal(false)} size="md">
					<div className="space-y-4">
						<h3 className="text-xl poppins-semibold mb-4">
							Review Requirement - {selectedRequirement.requirement_name}
						</h3>
						<div className="space-y-4">
							{/* Submitted Document */}
							{selectedRequirement.submitted_document_url && (
								<div>
									<label className="block text-sm poppins-semibold text-gray-700 mb-2">
										Submitted Document:
									</label>
									<a
										href={selectedRequirement.submitted_document_url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm poppins-medium text-blue-600 hover:text-blue-800 flex items-center gap-2">
										<FiFileText size={16} />
										View Document
									</a>
								</div>
							)}

							{/* Remarks */}
							<div>
								<label className="block text-sm poppins-semibold text-gray-700 mb-2">
									Remarks:
								</label>
								<textarea
									value={reviewRemarks}
									onChange={(e) => setReviewRemarks(e.target.value)}
									className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 poppins-regular"
									rows={4}
									placeholder="Enter remarks or feedback for the student..."
								/>
							</div>

							{/* Review Actions */}
							<div className="flex gap-3 justify-end pt-4 border-t">
								<button
									onClick={() => setShowReviewModal(false)}
									className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors poppins-medium">
									Cancel
								</button>
								<button
									onClick={() => handleSubmitReview("need_for_resubmission")}
									disabled={reviewLoading}
									className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium flex items-center gap-2">
									<FiXCircle size={16} />
									Need Resubmission
								</button>
								<button
									onClick={() => handleSubmitReview("approved")}
									disabled={reviewLoading}
									className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium flex items-center gap-2">
									<FiCheck size={16} />
									Approve
								</button>
							</div>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default ClassListingTab;

