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
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../../../components/DataTable";
import QuillEditor from "../../../components/QuillEditor";
import Modal from "../../../components/Modal";
import { FiEye, FiEdit2, FiLock, FiUnlock, FiTrash2 } from "react-icons/fi";

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
	} | null;
}

const PostOJTTab = () => {
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
		is_hiring: true, // Default to true for OJT openings
	});

	const fetchInternships = async () => {
		setLoading(true);
		try {
			const data = await getMyInternships();
			setInternships(data);
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Failed to load OJT openings",
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

	useEffect(() => {
		fetchInternships();
		fetchSkills();
	}, []);

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
			if (!selectedSkillIds.includes(skill.skill_id)) {
				setSelectedSkillIds([...selectedSkillIds, skill.skill_id]);
			}
			setNewSkillName("");
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
		if (!selectedSkillIds.includes(skill.skill_id)) {
			setSelectedSkillIds([...selectedSkillIds, skill.skill_id]);
		}
		setNewSkillName("");
		setShowAutocomplete(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const payload = {
				...formData,
				skill_ids: selectedSkillIds,
			};

			if (editingId) {
				await updateInternship(editingId, payload);
				Swal.fire({
					icon: "success",
					title: "Success",
					text: "OJT opening updated successfully. It is pending OJT Head approval.",
					timer: 3000,
					showConfirmButton: false,
				});
			} else {
				await createInternship(payload);
				Swal.fire({
					icon: "success",
					title: "Success",
					text: "OJT opening posted successfully. It is pending OJT Head approval.",
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
				text: err.message || "Failed to save OJT opening",
			});
		}
	};

	const handleEdit = (internship: Internship) => {
		setFormData({
			title: internship.title,
			description: internship.description,
			is_hiring: internship.is_hiring,
		});
		const skillIds = internship.internship_skills?.map((is) => is.skill.skill_id) || [];
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
					text: "OJT opening has been deleted.",
					timer: 2000,
					showConfirmButton: false,
				});
				fetchInternships();
			} catch (err: any) {
				console.error(err);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: err.message || "Failed to delete OJT opening",
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
				text: `OJT opening ${currentStatus === "enabled" ? "closed" : "opened"} successfully`,
				timer: 2000,
				showConfirmButton: false,
			});
			fetchInternships();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to update OJT opening status",
			});
		}
	};

	const handleCancel = () => {
		setFormData({ title: "", description: "", is_hiring: true });
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
			header: "Title",
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
							dangerouslySetInnerHTML={{ __html: desc }}
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
							title={internship.status === "enabled" ? "Close" : "Open"}>
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
				<h2 className="text-xl poppins-semibold">Post OJT Opening</h2>
				<button
					onClick={() => setShowModal(true)}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium">
					Post New OJT Opening
				</button>
			</div>

			{/* Modal */}
			{showModal && (
				<Modal onClose={handleCancel} size="lg">
					<h3 className="text-lg poppins-semibold mb-4">
						{editingId ? "Edit OJT Opening" : "New OJT Opening"}
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
								placeholder="Write OJT opening description..."
								className="bg-white"
							/>
						</div>

						{/* Skills Selection */}
						<div>
							<label className="block text-sm font-medium mb-2 poppins-medium">Required Skills</label>
							
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
											setTimeout(() => setShowAutocomplete(false), 200);
										}}
										onKeyPress={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleAddSkill();
											}
										}}
									/>
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

							{selectedSkillIds.length > 0 && (
								<div className="mt-2">
									<p className="text-sm text-gray-600 poppins-regular mb-1">
										Selected: {selectedSkillIds.length} skill(s)
									</p>
								</div>
							)}
						</div>

						<div>
							<label className="flex items-center gap-2 poppins-regular">
								<input
									type="checkbox"
									checked={formData.is_hiring}
									onChange={(e) =>
										setFormData({ ...formData, is_hiring: e.target.checked })
									}
								/>
								<span className="text-sm">Currently Accepting Applications</span>
							</label>
						</div>

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
								{editingId ? "Update OJT Opening" : "Post OJT Opening"}
							</button>
						</div>
					</form>
				</Modal>
			)}

			<h3 className="text-lg poppins-semibold mb-4">My OJT Openings</h3>
			<DataTable columns={columns} data={internships} loading={loading} />

			{/* Details Modal */}
			{showDetailsModal && selectedInternship && (
				<Modal onClose={() => setShowDetailsModal(false)} size="xl">
					<div className="space-y-6">
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
							</div>
						</div>

						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-2 poppins-semibold">
								Description
							</label>
							<div
								className="text-gray-700 poppins-regular prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200"
								dangerouslySetInnerHTML={{ __html: selectedInternship.description || "" }}
							/>
						</div>

						<div>
							<label className="text-sm font-semibold text-gray-700 block mb-2 poppins-semibold">
								Required Skills
							</label>
							<div className="flex flex-wrap gap-2">
								{selectedInternship.internship_skills && selectedInternship.internship_skills.length > 0 ? (
									selectedInternship.internship_skills.map((is, index) => (
										<span
											key={index}
											className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full poppins-medium shadow-sm">
											{is.skill.skill_name}
										</span>
									))
								) : (
									<span className="text-gray-400 text-sm italic">No skills assigned</span>
								)}
							</div>
						</div>

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
		</div>
	);
};

export default PostOJTTab;

