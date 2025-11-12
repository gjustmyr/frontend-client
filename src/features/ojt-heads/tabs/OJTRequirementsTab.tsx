import { useState, useEffect } from "react";
import Modal from "../modal/Modal";
import Swal from "sweetalert2";
import {
	createOJTRequirement,
	getOJTRequirements,
	toggleOJTRequirementStatus,
	updateOJTRequirement,
} from "../../../services/ojt-requirement.service";

const OJTRequirementsTab = () => {
	const [requirements, setRequirements] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingRequirement, setEditingRequirement] = useState<any>(null);
	const [formData, setFormData] = useState<any>({
		requirement_name: "",
		type: "pre-ojt",
		file: null,
	});
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
	const filteredRequirements = requirements.filter((req) => {
		const matchesSearch = req.requirement_name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesType = filterType === "all" || req.type === filterType;
		return matchesSearch && matchesType;
	});

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		try {
			const payload = new FormData();
			payload.append("requirement_name", formData.requirement_name);
			payload.append("type", formData.type);
			if (formData.file) payload.append("file", formData.file);

			if (editingRequirement) {
				await updateOJTRequirement(
					editingRequirement.ojt_requirement_id,
					payload
				);
				Swal.fire({
					icon: "success",
					title: "Updated!",
					text: "Requirement updated successfully",
					timer: 2000,
					showConfirmButton: false,
				});
			} else {
				await createOJTRequirement(payload);
				Swal.fire({
					icon: "success",
					title: "Added!",
					text: "Requirement added successfully",
					timer: 2000,
					showConfirmButton: false,
				});
			}

			setShowModal(false);
			setEditingRequirement(null);
			setFormData({ requirement_name: "", type: "pre-ojt", file: null });
			fetchRequirements();
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Something went wrong, please try again",
			});
		}
	};

	const handleEdit = (req: any) => {
		setEditingRequirement(req);
		setFormData({
			requirement_name: req.requirement_name,
			type: req.type,
			file: null,
		});
		setShowModal(true);
	};

	const handleToggleStatus = async (req: any) => {
		try {
			const result = await Swal.fire({
				title: "Are you sure?",
				text: `Do you want to ${
					req.status === "active" ? "deactivate" : "activate"
				} this requirement?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Yes",
				cancelButtonText: "Cancel",
			});

			if (!result.isConfirmed) return;

			await toggleOJTRequirementStatus(req.ojt_requirement_id);

			Swal.fire({
				icon: "success",
				title: "Success",
				text: `Requirement status updated successfully`,
				timer: 1500,
				showConfirmButton: false,
			});

			fetchRequirements();
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Failed to change status",
			});
		}
	};

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">OJT Requirements</h2>

			{/* Search + Type Filter + Add */}
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
				<button
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
					onClick={() => setShowModal(true)}>
					Add Requirement
				</button>
			</div>

			{loading ? (
				<p className="poppins-regular text-gray-500">Loading requirements...</p>
			) : filteredRequirements.length === 0 ? (
				<p className="poppins-regular text-gray-500">No requirements found.</p>
			) : (
				<div className="overflow-x-auto bg-white">
					<table className="min-w-full border-collapse text-sm">
						<thead className="bg-green-500 text-white poppins-semibold">
							<tr>
								<th className="px-4 py-2 text-left">Requirement</th>
								<th className="px-4 py-2 text-left">Type</th>
								<th className="px-4 py-2 text-center">Status</th>
								<th className="px-4 py-2 text-center">Document</th>
								<th className="px-4 py-2 text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="poppins-regular">
							{filteredRequirements.map((req: any, index: number) => (
								<tr
									key={req.ojt_requirement_id}
									className={`${
										index % 2 === 0 ? "bg-gray-50" : "bg-white"
									} hover:bg-blue-50`}>
									<td className="px-4 py-2">{req.requirement_name}</td>
									<td className="px-4 py-2">
										{req.type === "pre-ojt" ? "Pre-OJT" : "Post-OJT"}
									</td>
									<td className="px-4 py-2 text-center">
										<span
											className={`px-2 py-1 text-xs rounded-full ${
												req.status === "active"
													? "bg-green-100 text-green-700"
													: req.status === "expired"
													? "bg-yellow-100 text-yellow-700"
													: "bg-red-100 text-red-700"
											}`}>
											{req.status}
										</span>
									</td>
									<td className="px-4 py-2 text-center">
										<a
											href={req.document_url}
											target="_blank"
											rel="noreferrer"
											className="text-blue-600 hover:underline">
											View PDF
										</a>
									</td>
									<td className="px-4 py-2 text-center space-x-2">
										<button
											className="px-3 py-1 bg-yellow-400 text-white text-sm rounded hover:bg-yellow-500"
											onClick={() => handleEdit(req)}>
											Edit
										</button>
										<button
											className={`px-3 py-1 text-sm rounded text-white ${
												req.status === "active"
													? "bg-red-500 hover:bg-red-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											onClick={() => handleToggleStatus(req)}>
											Toggle Status
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Modal */}
			{showModal && (
				<Modal onClose={() => setShowModal(false)}>
					<h3 className="text-lg poppins-semibold mb-4">
						{editingRequirement ? "Edit Requirement" : "Add Requirement"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-3">
						<input
							type="text"
							placeholder="Requirement Name"
							className="w-full p-2 border rounded"
							value={formData.requirement_name}
							onChange={(e) =>
								setFormData({ ...formData, requirement_name: e.target.value })
							}
							required
						/>
						<select
							className="w-full p-2 border rounded"
							value={formData.type}
							onChange={(e) =>
								setFormData({ ...formData, type: e.target.value })
							}>
							<option value="pre-ojt">Pre-OJT</option>
							<option value="post-ojt">Post-OJT</option>
						</select>
						<input
							type="file"
							accept="application/pdf"
							className="w-full"
							onChange={(e) =>
								setFormData({ ...formData, file: e.target.files?.[0] })
							}
						/>
						<div className="flex justify-end space-x-2">
							<button
								type="button"
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								onClick={() => setShowModal(false)}>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-500">
								{editingRequirement ? "Update" : "Add"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
};

export default OJTRequirementsTab;
