import { useState, useEffect } from "react";
import {
	createOJTCoordinator,
	getOJTCoordinators,
	toggleOJTCoordinatorStatus,
	updateOJTCoordinator,
} from "../../../services/ojt-coordinator.service";
import Modal from "../modal/Modal";
import { getEnabledDepartments } from "../../../services/dropdown.service";
import Swal from "sweetalert2";

const OJTCoordinatorsTab = () => {
	const [coordinators, setCoordinators] = useState<any[]>([]);
	const [departments, setDepartments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingCoordinator, setEditingCoordinator] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState("all");

	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		email: "",
		department_id: "",
	});

	const fetchCoordinators = async () => {
		setLoading(true);
		try {
			const data = await getOJTCoordinators();
			setCoordinators(data);
		} catch (error) {
			console.error(error);
			Swal.fire("Error", "Failed to load coordinators.", "error");
		} finally {
			setLoading(false);
		}
	};

	const fetchDepartments = async () => {
		try {
			const data = await getEnabledDepartments();
			setDepartments(data);
		} catch (error) {
			console.error("Error loading departments:", error);
			Swal.fire("Error", "Failed to load departments.", "error");
		}
	};

	useEffect(() => {
		fetchCoordinators();
		fetchDepartments();
	}, []);

	const filteredCoordinators = coordinators.filter((coord: any) => {
		const fullName = `${coord.first_name} ${coord.middle_name || ""} ${
			coord.last_name
		}`.toLowerCase();
		const matchesSearch = fullName.includes(searchTerm.toLowerCase());
		const matchesDepartment =
			selectedDepartment === "all" ||
			String(coord.department_id) === String(selectedDepartment);
		return matchesSearch && matchesDepartment;
	});

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		try {
			if (editingCoordinator) {
				await updateOJTCoordinator(
					editingCoordinator.ojt_coordinator_id,
					formData
				);
				Swal.fire("Updated!", "Coordinator updated successfully.", "success");
			} else {
				await createOJTCoordinator(formData);
				Swal.fire("Created!", "Coordinator added successfully.", "success");
			}
			setShowModal(false);
			setEditingCoordinator(null);
			setFormData({
				first_name: "",
				middle_name: "",
				last_name: "",
				email: "",
				department_id: "",
			});
			fetchCoordinators();
		} catch (error: any) {
			console.error(error);
			Swal.fire(
				"Error",
				error?.response?.data?.message || "Something went wrong.",
				"error"
			);
		}
	};

	const handleEdit = (coordinator: any) => {
		setEditingCoordinator(coordinator);
		setFormData({
			first_name: coordinator.first_name,
			middle_name: coordinator.middle_name,
			last_name: coordinator.last_name,
			email: coordinator.user?.email || "",
			department_id: coordinator.department_id,
		});
		setShowModal(true);
	};

	const handleToggleStatus = async (coordinator: any) => {
		const action = coordinator.status === "enabled" ? "Disable" : "Enable";

		const result = await Swal.fire({
			title: `${action} Coordinator?`,
			text: `Are you sure you want to ${action.toLowerCase()} this coordinator?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: `Yes, ${action}`,
		});

		if (result.isConfirmed) {
			try {
				await toggleOJTCoordinatorStatus(coordinator.ojt_coordinator_id);
				await fetchCoordinators();
				Swal.fire(
					`${action}d!`,
					`Coordinator has been ${action.toLowerCase()}d.`,
					"success"
				);
			} catch (error) {
				console.error(error);
				Swal.fire("Error", "Failed to update status.", "error");
			}
		}
	};

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">OJT Coordinators</h2>

			{/* ✅ Search and Filter Controls */}
			<div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-4 space-y-2 md:space-y-0">
				<input
					type="text"
					placeholder="Search by name..."
					className="p-2 border rounded w-full md:w-1/3"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<select
					className="p-2 border rounded w-full md:w-1/4"
					value={selectedDepartment}
					onChange={(e) => setSelectedDepartment(e.target.value)}>
					<option value="all">All Departments</option>
					{departments.map((dept: any) => (
						<option key={dept.department_id} value={dept.department_id}>
							{dept.department_name}
						</option>
					))}
				</select>
				<button
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
					onClick={() => setShowModal(true)}>
					Add Coordinator
				</button>
			</div>

			{/* Table */}
			{loading ? (
				<div className="flex justify-center items-center py-10">
					<p className="text-gray-500 poppins-regular">
						Loading coordinators...
					</p>
				</div>
			) : filteredCoordinators.length === 0 ? (
				<div className="text-center py-10 text-gray-500 poppins-regular">
					No coordinators found.
				</div>
			) : (
				<div className="overflow-x-auto bg-white">
					<table className="min-w-full border-collapse text-sm">
						<thead className="bg-green-500 text-white poppins-semibold">
							<tr>
								<th className="px-4 py-3 text-left">Name</th>
								<th className="px-4 py-3 text-left">Email</th>
								<th className="px-4 py-3 text-left">Department</th>
								<th className="px-4 py-3 text-center">Status</th>
								<th className="px-4 py-3 text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
							{filteredCoordinators.map((coord: any, index: number) => (
								<tr
									key={coord.ojt_coordinator_id}
									className={`${
										index % 2 === 0 ? "bg-gray-50" : "bg-white"
									} hover:bg-blue-50 transition-colors border-b`}>
									<td className="px-4 py-3 whitespace-nowrap font-medium">
										{coord.first_name} {coord.middle_name} {coord.last_name}
									</td>
									<td className="px-4 py-3">{coord.user?.email || "N/A"}</td>
									<td className="px-4 py-3">
										{departments.find(
											(d: any) => d.department_id === coord.department_id
										)?.department_name || "N/A"}
									</td>
									<td className="px-4 py-3 text-center">
										<span
											className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
												coord.status === "enabled"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}>
											{coord.status === "enabled" ? "Published" : "Archived"}
										</span>
									</td>
									<td className="px-4 py-3 text-center space-x-2">
										<button
											className="px-3 py-1 bg-yellow-400 text-white text-sm rounded poppins-medium hover:bg-yellow-500 transition"
											onClick={() => handleEdit(coord)}>
											Edit
										</button>
										<button
											className={`px-3 py-1 text-sm rounded poppins-medium text-white transition ${
												coord.status === "enabled"
													? "bg-red-500 hover:bg-red-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											onClick={() => handleToggleStatus(coord)}>
											{coord.status === "enabled" ? "Disable" : "Enable"}
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
						{editingCoordinator ? "Edit Coordinator" : "Add Coordinator"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-3">
						<input
							type="text"
							placeholder="First Name"
							className="w-full p-2 border rounded"
							value={formData.first_name}
							onChange={(e) =>
								setFormData({ ...formData, first_name: e.target.value })
							}
							required
						/>
						<input
							type="text"
							placeholder="Middle Name"
							className="w-full p-2 border rounded"
							value={formData.middle_name}
							onChange={(e) =>
								setFormData({ ...formData, middle_name: e.target.value })
							}
						/>
						<input
							type="text"
							placeholder="Last Name"
							className="w-full p-2 border rounded"
							value={formData.last_name}
							onChange={(e) =>
								setFormData({ ...formData, last_name: e.target.value })
							}
							required
						/>
						{!editingCoordinator && (
							<input
								type="email"
								placeholder="Email"
								className="w-full p-2 border rounded"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								required
							/>
						)}

						<select
							className="w-full p-2 border rounded"
							value={formData.department_id}
							onChange={(e) =>
								setFormData({ ...formData, department_id: e.target.value })
							}
							required>
							<option value="">Select Department</option>
							{departments.map((dept: any) => (
								<option key={dept.department_id} value={dept.department_id}>
									{dept.department_name}
								</option>
							))}
						</select>

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
								{editingCoordinator ? "Update" : "Add"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
};

export default OJTCoordinatorsTab;
