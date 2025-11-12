import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
	getStudentRequirements,
	submitStudentRequirement,
	startOJT,
	finalizePostOJT,
	type StudentRequirementsData,
} from "../../../services/student-requirement.service";
import { getMyStudentInternship, type StudentInternship } from "../../../services/student-internship.service";
import { FiUpload, FiCheck, FiX, FiAlertCircle, FiFileText } from "react-icons/fi";

const RequirementsTab = () => {
	const [studentInternship, setStudentInternship] = useState<StudentInternship | null>(null);
	const [requirementsData, setRequirementsData] = useState<StudentRequirementsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState<number | null>(null);
	const [selectedRequirement, setSelectedRequirement] = useState<number | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [showSubmitModal, setShowSubmitModal] = useState(false);

	// Fetch student internship
	const fetchStudentInternship = async () => {
		try {
			const data = await getMyStudentInternship();
			setStudentInternship(data);
			return data;
		} catch (error: any) {
			console.error("Error fetching student internship:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load internship",
			});
			return null;
		}
	};

	// Fetch requirements
	const fetchRequirements = async (internshipId: number) => {
		try {
			const data = await getStudentRequirements(internshipId);
			setRequirementsData(data);
		} catch (error: any) {
			console.error("Error fetching requirements:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load requirements",
			});
		}
	};

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			const internship = await fetchStudentInternship();
			if (internship) {
				await fetchRequirements(internship.student_internship_id);
			}
			setLoading(false);
		};
		loadData();
	}, []);

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			if (selectedFile.type !== "application/pdf") {
				Swal.fire({
					icon: "error",
					title: "Invalid File",
					text: "Please select a PDF file",
				});
				return;
			}
			setFile(selectedFile);
		}
	};

	// Handle requirement submission
	const handleSubmitRequirement = async () => {
		if (!selectedRequirement || !file || !studentInternship) {
			return;
		}

		setSubmitting(selectedRequirement);
		try {
			await submitStudentRequirement(
				studentInternship.student_internship_id,
				selectedRequirement,
				file
			);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Requirement submitted successfully",
				timer: 2000,
				showConfirmButton: false,
			});
			setShowSubmitModal(false);
			setFile(null);
			setSelectedRequirement(null);
			if (studentInternship) {
				await fetchRequirements(studentInternship.student_internship_id);
			}
		} catch (error: any) {
			console.error("Error submitting requirement:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to submit requirement",
			});
		} finally {
			setSubmitting(null);
		}
	};

	// Handle start OJT
	const handleStartOJT = async () => {
		if (!studentInternship) return;

		Swal.fire({
			title: "Start OJT?",
			text: "Are you sure you want to start your OJT? This action cannot be undone.",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#10b981",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, Start OJT",
			cancelButtonText: "Cancel",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await startOJT(studentInternship.student_internship_id);
					Swal.fire({
						icon: "success",
						title: "Success",
						text: "OJT started successfully",
						timer: 2000,
						showConfirmButton: false,
					});
					// Reload data
					const internship = await fetchStudentInternship();
					if (internship) {
						await fetchRequirements(internship.student_internship_id);
					}
				} catch (error: any) {
					console.error("Error starting OJT:", error);
					Swal.fire({
						icon: "error",
						title: "Error",
						text: error.message || "Failed to start OJT",
					});
				}
			}
		});
	};

	// Handle finalize post-OJT
	const handleFinalizePostOJT = async () => {
		if (!studentInternship) return;

		Swal.fire({
			title: "Finalize Post-OJT?",
			text: "Are you sure all post-OJT requirements are approved and you want to finalize?",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#10b981",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Yes, Finalize",
			cancelButtonText: "Cancel",
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					await finalizePostOJT(studentInternship.student_internship_id);
					Swal.fire({
						icon: "success",
						title: "Success",
						text: "Post-OJT finalized successfully",
						timer: 2000,
						showConfirmButton: false,
					});
					// Reload data
					const internship = await fetchStudentInternship();
					if (internship) {
						await fetchRequirements(internship.student_internship_id);
					}
				} catch (error: any) {
					console.error("Error finalizing post-OJT:", error);
					Swal.fire({
						icon: "error",
						title: "Error",
						text: error.message || "Failed to finalize post-OJT",
					});
				}
			}
		});
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return (
					<span className="px-3 py-1 rounded-full text-xs poppins-semibold bg-green-100 text-green-700 flex items-center gap-1">
						<FiCheck size={14} /> Approved
					</span>
				);
			case "complied":
				return (
					<span className="px-3 py-1 rounded-full text-xs poppins-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
						<FiFileText size={14} /> Complied
					</span>
				);
			case "need_for_resubmission":
				return (
					<span className="px-3 py-1 rounded-full text-xs poppins-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
						<FiAlertCircle size={14} /> Need Resubmission
					</span>
				);
			case "not_complied":
			default:
				return (
					<span className="px-3 py-1 rounded-full text-xs poppins-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
						<FiX size={14} /> Not Complied
					</span>
				);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center py-10 text-gray-500">
				Loading...
			</div>
		);
	}

	if (!studentInternship) {
		return (
			<div className="text-center py-10 bg-blue-50 border border-blue-200 rounded-lg p-8">
				<div className="max-w-md mx-auto">
					<FiAlertCircle size={48} className="mx-auto text-blue-400 mb-4" />
					<h3 className="text-lg poppins-semibold text-gray-800 mb-2">
						No OJT Ongoing Yet
					</h3>
					<p className="text-gray-600 poppins-regular">
						Your OJT assignment is still being prepared. Once an internship is approved for you, the requirements checklist will appear here.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">OJT Requirements</h2>
			<p className="text-gray-600 poppins-regular mb-4">
				View and submit your OJT requirements
			</p>

			{/* Status Info */}
			{requirementsData && (
				<div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm poppins-regular text-gray-600">
								Current Status: <span className="poppins-semibold text-gray-800">{requirementsData.currentStatus}</span>
							</p>
							<p className="text-sm poppins-regular text-gray-600 mt-1">
								Requirement Type: <span className="poppins-semibold text-gray-800">{requirementsData.requirementType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
							</p>
						</div>
						{requirementsData.allApproved && (
							<div className="flex items-center gap-2">
								{requirementsData.requirementType === "pre-ojt" &&
									(studentInternship.status === "pre-ojt" || studentInternship.status === "starting") && (
										<button
											onClick={handleStartOJT}
											className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors poppins-medium">
											Start OJT
										</button>
									)}
								{requirementsData.requirementType === "post-ojt" &&
									studentInternship.status === "post-ojt" && (
										<button
											onClick={handleFinalizePostOJT}
											className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors poppins-medium">
											Finalize Post-OJT
										</button>
									)}
							</div>
						)}
					</div>
					{requirementsData.missingRequirements.length > 0 && (
						<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
							<p className="text-sm poppins-semibold text-yellow-800 mb-1">
								Missing Requirements:
							</p>
							<ul className="list-disc list-inside text-sm poppins-regular text-yellow-700">
								{requirementsData.missingRequirements.map((req, idx) => (
									<li key={idx}>{req.requirement_name || (typeof req === "string" ? req : "")}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}

			{/* Requirements List */}
			{requirementsData && requirementsData.requirements.length > 0 ? (
				<div className="space-y-4">
					{requirementsData.requirements.map((requirement) => (
						<div
							key={requirement.ojt_requirement_id}
							className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
							<div className="flex items-center justify-between mb-2">
								<div className="flex-1">
									<h3 className="text-lg poppins-semibold text-gray-800">
										{requirement.requirement_name}
									</h3>
							<p className="text-sm poppins-regular text-gray-600 mt-1">
								Type: {requirement.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</p>
								</div>
								<div className="flex items-center gap-3">
									{getStatusBadge(requirement.status)}
									{requirement.status !== "approved" && (
										<button
											onClick={() => {
												setSelectedRequirement(requirement.ojt_requirement_id);
												setShowSubmitModal(true);
												setFile(null);
											}}
											className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors poppins-medium flex items-center gap-2">
											<FiUpload size={16} />
											{requirement.status === "not_complied" ? "Submit" : "Resubmit"}
										</button>
									)}
								</div>
							</div>

							{/* Submitted Document */}
							{requirement.submitted_document_url && (
								<div className="mt-3 p-3 bg-gray-50 rounded">
									<p className="text-sm poppins-regular text-gray-600 mb-1">
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
									<p className="text-sm poppins-regular text-gray-600 mb-1">
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
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-10 text-gray-500">
					<p className="poppins-regular">No requirements available at this time.</p>
				</div>
			)}

			{/* Submit Modal */}
			{showSubmitModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg poppins-semibold mb-4">Submit Requirement</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm poppins-medium text-gray-700 mb-2">
									Select PDF File
								</label>
								<input
									type="file"
									accept="application/pdf"
									onChange={handleFileSelect}
									className="w-full p-2 border rounded"
								/>
								{file && (
									<p className="text-sm poppins-regular text-gray-600 mt-2">
										Selected: {file.name}
									</p>
								)}
							</div>
							<div className="flex justify-end gap-2">
								<button
									onClick={() => {
										setShowSubmitModal(false);
										setFile(null);
										setSelectedRequirement(null);
									}}
									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors poppins-medium">
									Cancel
								</button>
								<button
									onClick={handleSubmitRequirement}
									disabled={!file || submitting !== null}
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium">
									{submitting !== null ? "Submitting..." : "Submit"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RequirementsTab;

