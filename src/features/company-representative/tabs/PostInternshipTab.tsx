import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
	createInternship,
	getMyInternships,
	updateInternship,
	deleteInternship,
	toggleInternshipStatus,
} from "../../../services/internship.service";
import { getSkills, createOrGetSkill } from "../../../services/skill.service";
import {
	getJobRequirements,
	saveJobRequirements,
} from "../../../services/job-requirement.service";
import {
	getJobApplicationsForEmployer,
	updateJobApplicationStatus,
} from "../../../services/job-application.service";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/DataTable";
import QuillEditor from "../../../components/QuillEditor";
import Modal from "../../../components/Modal";
import { FiEye, FiEdit2, FiLock, FiUnlock, FiTrash2 } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";

type OpportunityMode = "internship" | "job";

interface PostOpportunityTabProps {
	mode?: OpportunityMode;
}

interface Skill {
	skill_id: number;
	skill_name: string;
	skill_description?: string;
}

interface InternshipSkill {
	internship_skill_id: number;
	skill: Skill;
}

interface Internship {
	internship_id: number;
	title: string;
	description: string;
	is_hiring: boolean;
	status: string;
	approval_status: "pending" | "approved" | "rejected";
	createdAt: string;
	internship_skills?: InternshipSkill[];
	employer?: {
		company_name: string;
		contact_person: string;
		contact_email: string;
		contact_phone: string;
	};
}

interface JobRequirementRecord {
	job_requirement_id?: number;
	title: string;
	description?: string;
	is_required: boolean;
	order: number;
}

interface JobApplicationRecord {
	job_application_id: number;
	status: string;
	createdAt: string;
	Alumni?: {
		alumni_id: number;
		first_name: string;
		middle_name?: string;
		last_name: string;
		User?: {
			email: string;
			status: string;
		};
	};
	AlumniRequirementSubmissions?: Array<{
		alumni_requirement_submission_id: number;
		job_requirement_id: number;
		status: "submitted" | "approved" | "rejected";
		document_url: string;
		remarks?: string;
	}>;
}

const PostOpportunityTab = ({ mode = "internship" }: PostOpportunityTabProps) => {
	const isJob = mode === "job";
	const entityLabel = isJob ? "Job Opening" : "Internship";
	const entityLabelPlural = isJob ? "Job Openings" : "Internships";
	const approvalActor = isJob ? "Job Placement Head" : "OJT Head";
	const jobApplicationStatuses: Array<{ value: string; label: string }> = [
		{ value: "applied", label: "Applied" },
		{ value: "under_review", label: "Under Review" },
		{ value: "requirements_pending", label: "Requirements Pending" },
		{ value: "interview", label: "Interview" },
		{ value: "hired", label: "Hired" },
		{ value: "rejected", label: "Rejected" },
	];

	const [internships, setInternships] = useState<Internship[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loadingSkills, setLoadingSkills] = useState(false);
	const [newSkillName, setNewSkillName] = useState("");
	const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		is_hiring: isJob,
	});
	const [showRequirementsModal, setShowRequirementsModal] = useState(false);
	const [requirements, setRequirements] = useState<JobRequirementRecord[]>([]);
	const [requirementsLoading, setRequirementsLoading] = useState(false);
	const [showApplicationsModal, setShowApplicationsModal] = useState(false);
	const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
	const [applicationsLoading, setApplicationsLoading] = useState(false);

	const fetchInternships = async () => {
		setLoading(true);
		try {
			const data = await getMyInternships();
			const typedData = (data || []) as Internship[];
			const filtered = typedData.filter((item) =>
				isJob ? item.is_hiring : !item.is_hiring
			);
			setInternships(filtered);
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: `Failed to load ${entityLabelPlural.toLowerCase()}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchSkills = async () => {
		setLoadingSkills(true);
		try {
			const data = await getSkills();
			setSkills(data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingSkills(false);
		}
	};

	const openRequirementsModal = async (internship: Internship) => {
		setSelectedInternship(internship);
		setRequirements([]);
		setRequirementsLoading(true);
		setShowRequirementsModal(true);
		try {
			const data = await getJobRequirements(internship.internship_id);
			setRequirements(
				(data.requirements || []).map((req: any, index: number) => ({
					job_requirement_id: req.job_requirement_id,
					title: req.title,
					description: req.description || "",
					is_required: req.is_required,
					order: req.order ?? index,
				}))
			);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load job requirements",
			});
			setShowRequirementsModal(false);
		} finally {
			setRequirementsLoading(false);
		}
	};

	const handleRequirementFieldChange = (
		index: number,
		field: keyof JobRequirementRecord,
		value: any
	) => {
		setRequirements((prev) => {
			const next = [...prev];
			next[index] = { ...next[index], [field]: value };
			return next;
		});
	};

	const addRequirementRow = () => {
		setRequirements((prev) => [
			...prev,
			{
				title: "",
				description: "",
				is_required: true,
				order: prev.length,
			},
		]);
	};

	const removeRequirementRow = (index: number) => {
		setRequirements((prev) => prev.filter((_, idx) => idx !== index));
	};

	const saveRequirements = async () => {
		if (!selectedInternship) return;
		try {
			await saveJobRequirements(selectedInternship.internship_id, requirements);
			Swal.fire({
				icon: "success",
				title: "Saved",
				text: "Job requirements updated successfully.",
				timer: 2000,
				showConfirmButton: false,
			});
			setShowRequirementsModal(false);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to save job requirements",
			});
		}
	};

	const openApplicationsModal = async (internship: Internship) => {
		setSelectedInternship(internship);
		setApplications([]);
		setApplicationsLoading(true);
		setShowApplicationsModal(true);
		try {
			const data = await getJobApplicationsForEmployer(internship.internship_id);
			setApplications(data || []);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load job applications",
			});
			setShowApplicationsModal(false);
		} finally {
			setApplicationsLoading(false);
		}
	};

	const handleApplicationStatusChange = async (
		applicationId: number,
		status: string
	) => {
		try {
			await updateJobApplicationStatus(applicationId, status);
			Swal.fire({
				icon: "success",
				title: "Updated",
				text: "Application status updated.",
				timer: 1800,
				showConfirmButton: false,
			});
			if (selectedInternship) {
				openApplicationsModal(selectedInternship);
			}
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to update application status",
			});
		}
	};

	useEffect(() => {
		fetchInternships();
		fetchSkills();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode]);

	const handleAddSkill = async () => {
		if (!newSkillName.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Warning",
				text: "Please enter a skill name",
			});
			return;
		}

		try {
			const skill = await createOrGetSkill(newSkillName.trim());
			// Add to selected skills if not already selected
			if (!selectedSkillIds.includes(skill.skill_id)) {
				setSelectedSkillIds([...selectedSkillIds, skill.skill_id]);
			}
			setNewSkillName("");
			// Refresh skills list
			await fetchSkills();
			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Skill added successfully",
				timer: 1500,
				showConfirmButton: false,
			});
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to add skill",
			});
		}
	};

	const handleToggleSkill = (skillId: number) => {
		if (selectedSkillIds.includes(skillId)) {
			setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
		} else {
			setSelectedSkillIds([...selectedSkillIds, skillId]);
		}
	};

	const handleSkillInputChange = (value: string) => {
		setNewSkillName(value);
		if (value.trim().length > 0) {
			const filtered = skills.filter((skill) =>
				skill.skill_name.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredSkills(filtered);
			setShowAutocomplete(filtered.length > 0);
		} else {
			setShowAutocomplete(false);
		}
	};

	const handleSelectSkillFromAutocomplete = (skill: Skill) => {
		// Add skill to selected skills if not already selected
		if (!selectedSkillIds.includes(skill.skill_id)) {
			setSelectedSkillIds([...selectedSkillIds, skill.skill_id]);
			// Show brief success feedback
			Swal.fire({
				icon: "success",
				title: "Skill Added",
				text: `${skill.skill_name} has been added to selected skills`,
				timer: 1500,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} else {
			// If already selected, show message
			Swal.fire({
				icon: "info",
				title: "Already Selected",
				text: `${skill.skill_name} is already in your selected skills`,
				timer: 1500,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		}
		setNewSkillName("");
		setShowAutocomplete(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const payload: {
				title: string;
				description: string;
				is_hiring: boolean;
				skill_ids?: number[];
			} = {
				title: formData.title,
				description: formData.description,
				is_hiring: isJob ? true : false,
			};

			if (!isJob && formData.is_hiring) {
				payload.is_hiring = true;
			}

			if (selectedSkillIds.length > 0) {
				payload.skill_ids = selectedSkillIds;
			}

			if (editingId) {
				await updateInternship(editingId, payload);
				Swal.fire({
					icon: "success",
					title: "Success",
					text: `${entityLabel} updated successfully. It is pending ${approvalActor} approval.`,
					timer: 3000,
					showConfirmButton: false,
				});
			} else {
				await createInternship(payload);
				Swal.fire({
					icon: "success",
					title: "Success",
					text: `${entityLabel} posted successfully. It is pending ${approvalActor} approval.`,
					timer: 3000,
					showConfirmButton: false,
				});
			}
			handleCancel();
			fetchInternships();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to save internship",
			});
		}
	};

	const handleEdit = (internship: Internship) => {
		setFormData({
			title: internship.title,
			description: internship.description,
			is_hiring: isJob ? true : internship.is_hiring,
		});
		// Set selected skills from internship
		const skillIds =
			internship.internship_skills?.map((is) => is.skill.skill_id) || [];
		setSelectedSkillIds(skillIds);
		setEditingId(internship.internship_id);
		setShowModal(true);
	};

	const handleDelete = async (internshipId: number) => {
		const result = await Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Yes, delete it!",
		});

		if (result.isConfirmed) {
			try {
				await deleteInternship(internshipId);
				Swal.fire({
					icon: "success",
					title: "Deleted!",
					text: `${entityLabel} has been deleted.`,
					timer: 2000,
					showConfirmButton: false,
				});
				fetchInternships();
			} catch (err: any) {
				console.error(err);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: err.message || `Failed to delete ${entityLabel.toLowerCase()}`,
				});
			}
		}
	};

	const handleToggleStatus = async (internshipId: number, currentStatus: string) => {
		try {
			await toggleInternshipStatus(internshipId);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: `${entityLabel} ${
					currentStatus === "enabled" ? "closed" : "opened"
				} successfully`,
				timer: 2000,
				showConfirmButton: false,
			});
			fetchInternships();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || `Failed to update ${entityLabel.toLowerCase()} status`,
			});
		}
	};

	const handleCancel = () => {
		setFormData({ title: "", description: "", is_hiring: isJob });
		setSelectedSkillIds([]);
		setNewSkillName("");
		setShowAutocomplete(false);
		setFilteredSkills([]);
		setShowModal(false);
		setEditingId(null);
	};

	const handleViewDetails = (internship: Internship) => {
		setSelectedInternship(internship);
		setShowDetailsModal(true);
	};

	const getApprovalStatusBadge = (status: string) => {
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

	const columns: ColumnDef<Internship>[] = [
		{
			accessorKey: "title",
			header: `${entityLabel} Title`,
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => {
				const desc = row.original.description || "";
				const textContent = desc.replace(/<[^>]*>/g, "");
				return (
					<div className="max-w-md">
						<div
							className="text-sm prose prose-sm max-w-none line-clamp-2"
							style={{ maxHeight: "60px", overflow: "hidden" }}
							title={textContent}
							dangerouslySetInnerHTML={{
								__html: desc,
							}}
						/>
					</div>
				);
			},
		},
		{
			accessorKey: "skills",
			header: "Skills",
			cell: ({ row }) => {
				const skills = row.original.internship_skills?.map((is) => is.skill.skill_name) || [];
				return (
					<div className="flex flex-wrap gap-1">
						{skills.length > 0 ? (
							skills.map((skillName, index) => (
								<span
									key={index}
									className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full poppins-medium">
									{skillName}
								</span>
							))
						) : (
							<span className="text-gray-400 text-sm">No skills</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "approval_status",
			header: "Approval Status",
			cell: ({ row }) => getApprovalStatusBadge(row.original.approval_status),
		},
		...(!isJob
			? [
					{
						accessorKey: "is_hiring",
						header: "Listed for Alumni",
						cell: ({ row }: { row: any }) => {
							return (
								<div className="text-center">
									<span
										className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
											row.original.is_hiring
												? "bg-green-100 text-green-700"
												: "bg-gray-100 text-gray-700"
										}`}>
										{row.original.is_hiring ? "Yes" : "No"}
									</span>
								</div>
							);
						},
					} as ColumnDef<Internship>,
			  ]
			: []),
		{
			accessorKey: "status",
			header: "Publication Status",
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
		{
			accessorKey: "createdAt",
			header: "Posted Date",
			cell: ({ row }) => {
				return new Date(row.original.createdAt).toLocaleDateString();
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const internship = row.original;
				return (
					<div className="flex items-center gap-2">
						{isJob && (
							<>
								<button
									onClick={() => openRequirementsModal(internship)}
									className="p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
									title="Manage Requirements">
									Req
								</button>
								<button
									onClick={() => openApplicationsModal(internship)}
									className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
									title="View Applications">
									Apps
								</button>
							</>
						)}
						<button
							onClick={() => handleViewDetails(internship)}
							className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
							title="View Details">
							<FiEye size={18} />
						</button>
						<button
							onClick={() => handleEdit(internship)}
							className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
							title="Edit">
							<FiEdit2 size={18} />
						</button>
						<button
							onClick={() => handleToggleStatus(internship.internship_id, internship.status)}
							className={`p-2 text-white rounded transition-colors ${
								internship.status === "enabled"
									? "bg-orange-500 hover:bg-orange-600"
									: "bg-green-500 hover:bg-green-600"
							}`}
							title={internship.status === "enabled" ? "Archive" : "Publish"}>
							{internship.status === "enabled" ? <FiLock size={18} /> : <FiUnlock size={18} />}
						</button>
						<button
							onClick={() => handleDelete(internship.internship_id)}
							className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
							title="Delete">
							<FiTrash2 size={18} />
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl poppins-semibold">{`Post ${entityLabel}`}</h2>
				<button
					onClick={() => setShowModal(true)}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium">
					{`Post New ${entityLabel}`}
				</button>
			</div>

			{/* Modal */}
			{showModal && (
				<Modal onClose={handleCancel} size="lg">
					<h3 className="text-lg poppins-semibold mb-4">
						{editingId ? `Edit ${entityLabel} Posting` : `New ${entityLabel} Posting`}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1 poppins-medium">Title *</label>
							<input
								type="text"
								className="w-full p-2 border rounded poppins-regular"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 poppins-medium">Description *</label>
							<QuillEditor
								value={formData.description}
								onChange={(value) => setFormData({ ...formData, description: value })}
								placeholder="Write internship description..."
								className="bg-white"
							/>
						</div>

						{/* Skills Selection */}
						<div>
							<label className="block text-sm font-medium mb-2 poppins-medium">Required Skills</label>
							
							{/* Add New Skill with Autocomplete */}
							<div className="relative flex gap-2 mb-3">
								<div className="flex-1 relative">
									<input
										type="text"
										placeholder="Enter new skill name or select from existing..."
										className="w-full p-2 border rounded poppins-regular"
										value={newSkillName}
										onChange={(e) => handleSkillInputChange(e.target.value)}
										onFocus={() => {
											if (newSkillName.trim().length > 0 && filteredSkills.length > 0) {
												setShowAutocomplete(true);
											}
										}}
										onBlur={() => {
											// Delay to allow click on autocomplete item
											setTimeout(() => setShowAutocomplete(false), 200);
										}}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddSkill();
											}
										}}
									/>
									{/* Autocomplete Dropdown */}
									{showAutocomplete && filteredSkills.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
											{filteredSkills.map((skill) => (
												<div
													key={skill.skill_id}
													onClick={() => handleSelectSkillFromAutocomplete(skill)}
													className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
														selectedSkillIds.includes(skill.skill_id)
															? "bg-green-50 border-l-4 border-green-500"
															: ""
													}`}>
													<div className="flex items-center justify-between">
														<span className="poppins-regular text-gray-800">
															{skill.skill_name}
														</span>
														{selectedSkillIds.includes(skill.skill_id) && (
															<span className="text-green-600 text-xs poppins-medium">
																✓ Selected
															</span>
														)}
													</div>
													{skill.skill_description && (
														<p className="text-xs text-gray-500 mt-1 line-clamp-1">
															{skill.skill_description}
														</p>
													)}
												</div>
											))}
										</div>
									)}
								</div>
								<button
									type="button"
									onClick={handleAddSkill}
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 poppins-medium">
									Add Skill
								</button>
							</div>

							{/* Skills List */}
							<div className="border rounded p-3 max-h-40 overflow-y-auto">
								{loadingSkills ? (
									<p className="text-gray-500 text-sm">Loading skills...</p>
								) : skills.length === 0 ? (
									<p className="text-gray-500 text-sm">No skills available</p>
								) : (
									<div className="flex flex-wrap gap-2">
										{skills.map((skill) => (
											<button
												key={skill.skill_id}
												type="button"
												onClick={() => handleToggleSkill(skill.skill_id)}
												className={`px-3 py-1 rounded-full text-sm poppins-medium transition-colors ${
													selectedSkillIds.includes(skill.skill_id)
														? "bg-green-500 text-white hover:bg-green-600"
														: "bg-gray-200 text-gray-700 hover:bg-gray-300"
												}`}>
												{skill.skill_name}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Selected Skills Display */}
							{selectedSkillIds.length > 0 && (
								<div className="mt-2">
									<p className="text-sm text-gray-600 poppins-regular mb-1">
										Selected: {selectedSkillIds.length} skill(s)
									</p>
								</div>
							)}
						</div>

						{!isJob ? (
							<div>
								<label className="flex items-center gap-2 poppins-regular">
									<input
										type="checkbox"
										checked={formData.is_hiring}
										onChange={(e) =>
											setFormData({ ...formData, is_hiring: e.target.checked })
										}
									/>
									<span className="text-sm">
										Also list as a job opening for alumni
									</span>
								</label>
							</div>
						) : (
							<p className="text-sm text-gray-600 poppins-regular">
								Job openings are automatically tagged as hiring opportunities for
								alumni applicants.
							</p>
						)}

						<div className="flex justify-end gap-2 pt-4 border-t">
							<button
								type="button"
								onClick={handleCancel}
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 poppins-medium">
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium">
								{editingId ? `Update ${entityLabel}` : `Post ${entityLabel}`}
							</button>
						</div>
					</form>
				</Modal>
			)}

			<h3 className="text-lg poppins-semibold mb-4">{`My ${entityLabel} Postings`}</h3>
			<DataTable columns={columns} data={internships} loading={loading} />

			{/* Opportunity Details Modal */}
			{showDetailsModal && selectedInternship && (
				<Modal onClose={() => setShowDetailsModal(false)} size="xl">
					<div className="space-y-6">
						{/* Header Section */}
						<div className="border-b pb-4">
							<h3 className="text-2xl poppins-bold text-gray-800 mb-2">{selectedInternship.title}</h3>
							<div className="flex items-center gap-3 flex-wrap">
								{getApprovalStatusBadge(selectedInternship.approval_status)}
								<span
									className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
										selectedInternship.status === "enabled"
											? "bg-green-100 text-green-700"
											: "bg-red-100 text-red-700"
									}`}>
									{selectedInternship.status === "enabled" ? "Published" : "Archived"}
								</span>
								{isJob ? (
									<span className="px-3 py-1 rounded-full text-xs poppins-semibold bg-blue-100 text-blue-700">
										Job Opening
									</span>
								) : (
									<span
										className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
											selectedInternship.is_hiring
												? "bg-blue-100 text-blue-700"
												: "bg-gray-100 text-gray-700"
										}`}>
										{selectedInternship.is_hiring ? "Listed for Alumni" : "OJT Only"}
									</span>
								)}
							</div>
						</div>

						{/* Company Information Section */}
						{selectedInternship.employer && (
							<div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 border border-purple-100">
								<h4 className="text-lg poppins-semibold text-gray-800 mb-4 flex items-center gap-2">
									<MdBusiness className="text-purple-600" size={22} />
									Company Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
											Company Name
										</label>
										<p className="text-gray-800 poppins-medium">{selectedInternship.employer.company_name}</p>
									</div>
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
											Contact Person
										</label>
										<p className="text-gray-800 poppins-medium">
											{selectedInternship.employer.contact_person || "N/A"}
										</p>
									</div>
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
											Email
										</label>
										<p className="text-gray-800 poppins-regular">{selectedInternship.employer.contact_email}</p>
									</div>
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
											Phone
										</label>
										<p className="text-gray-800 poppins-regular">{selectedInternship.employer.contact_phone}</p>
									</div>
								</div>
							</div>
						)}

						{/* Description Section */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-2 poppins-semibold">
								Description
							</label>
							<div
								className="text-gray-700 poppins-regular prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200"
								dangerouslySetInnerHTML={{ __html: selectedInternship.description || "" }}
							/>
						</div>

						{/* Skills Section */}
						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-2 poppins-semibold">
								Required Skills
							</label>
							<div className="flex flex-wrap gap-2">
								{selectedInternship.internship_skills && selectedInternship.internship_skills.length > 0 ? (
									selectedInternship.internship_skills.map((is, index) => (
										<span
											key={index}
											className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full poppins-medium shadow-sm hover:shadow-md transition-shadow">
											{is.skill.skill_name}
										</span>
									))
								) : (
									<span className="text-gray-400 text-sm italic">No skills assigned</span>
								)}
							</div>
						</div>

						{/* Additional Info Section */}
						<div className="pt-4 border-t">
							<div>
								<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
									Posted Date
								</label>
								<p className="text-gray-800 poppins-regular">
									{new Date(selectedInternship.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{isJob && showRequirementsModal && selectedInternship && (
				<Modal onClose={() => setShowRequirementsModal(false)} size="lg">
					<h3 className="text-xl poppins-semibold text-gray-800 mb-4">
						Manage Requirements – {selectedInternship.title}
					</h3>
					{requirementsLoading ? (
						<div className="flex justify-center items-center py-10">
							<p className="text-gray-500 poppins-regular">Loading requirements…</p>
						</div>
					) : (
						<div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
							{requirements.length === 0 && (
								<p className="text-sm text-gray-500 poppins-regular">
									No requirements defined yet. Add one below.
								</p>
							)}
							{requirements.map((req, index) => (
								<div
									key={req.job_requirement_id ?? `new-${index}`}
									className="border border-gray-200 rounded-lg p-4 space-y-3">
									<div>
										<label className="block text-sm poppins-medium text-gray-600 mb-1">
											Requirement Title
										</label>
										<input
											value={req.title}
											onChange={(e) =>
												handleRequirementFieldChange(index, "title", e.target.value)
											}
											className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm poppins-medium text-gray-600 mb-1">
											Description (optional)
										</label>
										<input
											value={req.description || ""}
											onChange={(e) =>
												handleRequirementFieldChange(index, "description", e.target.value)
											}
											className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
										/>
									</div>
									<div className="flex items-center justify-between">
										<label className="inline-flex items-center gap-2 text-sm text-gray-600">
											<input
												type="checkbox"
												checked={req.is_required}
												onChange={(e) =>
													handleRequirementFieldChange(
														index,
														"is_required",
														e.target.checked
													)
												}
											/>
											Required submission
										</label>
										<button
											type="button"
											onClick={() => removeRequirementRow(index)}
											className="text-sm text-red-500 hover:underline">
											Remove
										</button>
									</div>
								</div>
							))}

							<button
								type="button"
								onClick={addRequirementRow}
								className="px-4 py-2 bg-green-500 text-white rounded poppins-medium hover:bg-green-600">
								Add Requirement
							</button>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-4">
						<button
							type="button"
							onClick={() => setShowRequirementsModal(false)}
							className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 poppins-medium">
							Cancel
						</button>
						<button
							type="button"
							onClick={saveRequirements}
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium">
							Save Requirements
						</button>
					</div>
				</Modal>
			)}

			{isJob && showApplicationsModal && selectedInternship && (
				<Modal onClose={() => setShowApplicationsModal(false)} size="xl">
					<h3 className="text-xl poppins-semibold text-gray-800 mb-4">
						Applications – {selectedInternship.title}
					</h3>
					{applicationsLoading ? (
						<div className="flex justify-center items-center py-10">
							<p className="text-gray-500 poppins-regular">Loading applications…</p>
						</div>
					) : applications.length === 0 ? (
						<div className="text-center py-8 text-gray-500 poppins-regular">
							No applications submitted yet.
						</div>
					) : (
						<div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
							{applications.map((application) => (
								<div
									key={application.job_application_id}
									className="border border-gray-200 rounded-lg p-4 space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<p className="poppins-semibold text-gray-800">
												{application.Alumni
													? `${application.Alumni.first_name}${
															application.Alumni.middle_name
																? ` ${application.Alumni.middle_name}`
																: ""
														} ${application.Alumni.last_name}`
													: "Unknown applicant"}
											</p>
											<p className="text-xs text-gray-500">
												{application.Alumni?.User?.email || "No email"}
											</p>
										</div>
										<select
											value={application.status}
											onChange={(e) =>
												handleApplicationStatusChange(
													application.job_application_id,
													e.target.value
												)
											}
											className="px-3 py-2 border border-gray-300 rounded poppins-regular text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
											{jobApplicationStatuses.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
									<p className="text-xs text-gray-400">
										Applied on {new Date(application.createdAt).toLocaleDateString()}
									</p>

									{application.AlumniRequirementSubmissions &&
										application.AlumniRequirementSubmissions.length > 0 && (
											<div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
												<p className="text-sm poppins-medium text-gray-700">
													Submitted Requirements
												</p>
												{application.AlumniRequirementSubmissions.map((submission) => (
													<div
														key={submission.alumni_requirement_submission_id}
														className="flex items-center justify-between text-sm">
														<a
															href={submission.document_url}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:underline">
															View document
														</a>
														<span className="text-xs text-gray-500 uppercase">
															{submission.status}
														</span>
													</div>
												))}
											</div>
										)}
								</div>
							))}
						</div>
					)}
				</Modal>
			)}
		</div>
	);
};

const PostInternshipTab = () => <PostOpportunityTab mode="internship" />;
export const PostJobOpeningTab = () => <PostOpportunityTab mode="job" />;

export default PostInternshipTab;
