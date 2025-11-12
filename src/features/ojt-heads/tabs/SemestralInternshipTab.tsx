import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Modal from "../modal/Modal";
import { getOJTCoordinators } from "../../../services/ojt-coordinator.service";
import {
	createSemestralInternship,
	updateSemestralInternship,
	toggleSemestralInternshipStatus,
	getSemestralInternships,
} from "../../../services/semestral-internship.service";
import { getSectionsByCoordinator } from "../../../services/section.service";

interface Listing {
	ojt_coordinator_id: string;
	section: string; // section id
}

interface InternshipForm {
	academic_year: string;
	semestral: string;
	listings: Listing[];
}

const SemestralInternshipTab = () => {
	const [internships, setInternships] = useState<any[]>([]);
	const [coordinators, setCoordinators] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingInternship, setEditingInternship] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");

	const [availableSections, setAvailableSections] = useState<{
		[key: number]: any[];
	}>({});

	const [formData, setFormData] = useState<InternshipForm>({
		academic_year: "",
		semestral: "",
		listings: [{ ojt_coordinator_id: "", section: "" }],
	});

	const generateAcademicYears = () => {
		const startYear = 2020;
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let y = startYear; y <= currentYear; y++) {
			years.push(`${y}-${y + 1}`);
		}
		return years;
	};

	const fetchInternships = async () => {
		setLoading(true);
		try {
			const data = await getSemestralInternships();
			setInternships(data);
		} catch (err) {
			console.error(err);
			Swal.fire("Error", "Failed to load internships.", "error");
		} finally {
			setLoading(false);
		}
	};

	const fetchCoordinators = async () => {
		try {
			const data = await getOJTCoordinators();
			setCoordinators(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchInternships();
		fetchCoordinators();
	}, []);

	const filteredInternships = internships.filter((internship) =>
		internship.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const resetForm = () => {
		setShowModal(false);
		setEditingInternship(null);
		setFormData({
			academic_year: "",
			semestral: "",
			listings: [{ ojt_coordinator_id: "", section: "" }],
		});
		setAvailableSections({});
	};

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		try {
			if (editingInternship) {
				await updateSemestralInternship(
					editingInternship.semestral_internship_id,
					formData
				);
				Swal.fire("Updated!", "Internship updated successfully.", "success");
			} else {
				await createSemestralInternship(formData);
				Swal.fire("Created!", "Internship added successfully.", "success");
			}
			resetForm();
			fetchInternships();
		} catch (err: any) {
			console.error(err);
			Swal.fire(
				"Error",
				err?.response?.data?.message || "Something went wrong.",
				"error"
			);
		}
	};

	const handleEdit = (internship: any) => {
		setEditingInternship(internship);
		setFormData({
			academic_year: internship.academic_year,
			semestral: internship.semestral,
			listings: internship.semestral_internship_listings.map((l: any) => ({
				ojt_coordinator_id: l.ojt_coordinator_id.toString(),
				section: l.section_id.toString(),
			})),
		});

		internship.semestral_internship_listings.forEach(
			async (listing: any, index: number) => {
				if (listing.ojt_coordinator_id) {
					try {
						const sections = await getSectionsByCoordinator(
							Number(listing.ojt_coordinator_id)
						);
						setAvailableSections((prev) => ({ ...prev, [index]: sections }));
					} catch (err) {
						console.error(err);
					}
				}
			}
		);

		setShowModal(true);
	};

	const handleListingChange = async (
		index: number,
		field: keyof Listing,
		value: any
	) => {
		const updatedListings = [...formData.listings];
		updatedListings[index][field] = value;
		setFormData({ ...formData, listings: updatedListings });

		if (field === "ojt_coordinator_id" && value) {
			try {
				const sections = await getSectionsByCoordinator(Number(value));
				setAvailableSections((prev) => ({ ...prev, [index]: sections }));
				updatedListings[index].section = "";
				setFormData({ ...formData, listings: updatedListings });
			} catch (err) {
				console.error(err);
			}
		}
	};

	const addListing = () => {
		setFormData({
			...formData,
			listings: [...formData.listings, { ojt_coordinator_id: "", section: "" }],
		});
	};

	const removeListing = (index: number) => {
		const updated = formData.listings.filter((_, i) => i !== index);
		setFormData({ ...formData, listings: updated });
		const updatedSections = { ...availableSections };
		delete updatedSections[index];
		setAvailableSections(updatedSections);
	};

	const handleToggleStatus = async (internship: any) => {
		const action = internship.status === "opened" ? "Close" : "Open";
		const result = await Swal.fire({
			title: `${action} Internship?`,
			text: `Are you sure you want to ${action.toLowerCase()} this internship?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: `Yes, ${action}`,
		});

		if (result.isConfirmed) {
			try {
				await toggleSemestralInternshipStatus(
					internship.semestral_internship_id
				);
				fetchInternships();
				Swal.fire(
					`${action}d!`,
					`Internship has been ${action.toLowerCase()}d.`,
					"success"
				);
			} catch (err) {
				console.error(err);
				Swal.fire("Error", "Failed to update status.", "error");
			}
		}
	};

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">Semestral Internships</h2>

			{/* Search & Add */}
			<div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-4 space-y-2 md:space-y-0">
				<input
					type="text"
					placeholder="Search by academic year..."
					className="p-2 border rounded w-full md:w-1/3"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<button
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
					onClick={() => setShowModal(true)}>
					Add Internship
				</button>
			</div>

			{/* Internship Table */}
			{loading ? (
				<div className="flex justify-center py-10 text-gray-500">
					Loading...
				</div>
			) : filteredInternships.length === 0 ? (
				<div className="text-center py-10 text-gray-500">
					No internships found.
				</div>
			) : (
				<div className="overflow-x-auto bg-white">
					<table className="min-w-full border-collapse text-sm">
						<thead className="bg-green-500 text-white poppins-semibold">
							<tr>
								<th className="px-4 py-3 text-left">Academic Year</th>
								<th className="px-4 py-3 text-left">Semestral</th>
								{/* <th className="px-4 py-3 text-left">Listings</th> */}
								<th className="px-4 py-3 text-center">Status</th>
								<th className="px-4 py-3 text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
							{filteredInternships.map((internship, idx) => (
								<tr
									key={internship.semestral_internship_id}
									className={`${
										idx % 2 === 0 ? "bg-gray-50" : "bg-white"
									} hover:bg-blue-50 transition-colors border-b`}>
									<td className="px-4 py-3">{internship.academic_year}</td>
									<td className="px-4 py-3">{internship.semestral}</td>
									{/* <td className="px-4 py-3">
										{internship.semestral_internship_listings.map((l: any) => (
											<div key={l.ojt_coordinator_id + "-" + l.section_id}>
												<strong>
													{l.ojt_coordinator?.first_name}{" "}
													{l.ojt_coordinator?.last_name}
												</strong>
												: {l.section?.section_name}
											</div>
										))}
									</td> */}
									<td className="px-4 py-3 text-center">
										<span
											className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
												internship.status === "opened"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}>
											{internship.status}
										</span>
									</td>
									<td className="px-4 py-3 text-center space-x-2">
										<button
											className="px-3 py-1 bg-yellow-400 text-white text-sm rounded hover:bg-yellow-500"
											onClick={() => handleEdit(internship)}>
											Edit
										</button>
										<button
											className={`px-3 py-1 text-sm rounded text-white ${
												internship.status === "opened"
													? "bg-red-500 hover:bg-red-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											onClick={() => handleToggleStatus(internship)}>
											{internship.status === "opened" ? "Close" : "Open"}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Modal Form */}
			{showModal && (
				<Modal onClose={resetForm}>
					<h3 className="text-lg poppins-semibold mb-4">
						{editingInternship ? "Edit Internship" : "Add Internship"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-3">
						<select
							className="w-full p-2 border rounded"
							value={formData.academic_year}
							onChange={(e) =>
								setFormData({ ...formData, academic_year: e.target.value })
							}
							required>
							<option value="">Select Academic Year</option>
							{generateAcademicYears().map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
						<select
							className="w-full p-2 border rounded"
							value={formData.semestral}
							onChange={(e) =>
								setFormData({ ...formData, semestral: e.target.value })
							}
							required>
							<option value="">Select Semestral</option>
							<option value="1st Semester">1st Semester</option>
							<option value="2nd Semester">2nd Semester</option>
							<option value="Midterm">Midterm</option>
						</select>

						<h4 className="poppins-semibold">Listings</h4>
						{formData.listings.map((listing, index) => (
							<div key={index} className="border p-2 mb-2 rounded">
								<select
									className="w-full p-2 border rounded mb-2"
									value={listing.ojt_coordinator_id}
									onChange={(e) =>
										handleListingChange(
											index,
											"ojt_coordinator_id",
											e.target.value
										)
									}
									required>
									<option value="">Select Coordinator</option>
									{coordinators.map((coord) => (
										<option
											key={coord.ojt_coordinator_id}
											value={coord.ojt_coordinator_id}>
											{coord.first_name} {coord.last_name}
										</option>
									))}
								</select>

								<select
									className="w-full p-2 border rounded mb-2"
									value={listing.section}
									onChange={(e) =>
										handleListingChange(index, "section", e.target.value)
									}
									required>
									<option value="">Select Section</option>
									{availableSections[index]?.map((section) => (
										<option key={section.section_id} value={section.section_id}>
											{section.section_name}
										</option>
									))}
								</select>

								{formData.listings.length > 1 && (
									<button
										type="button"
										className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										onClick={() => removeListing(index)}>
										Remove
									</button>
								)}
							</div>
						))}

						<button
							type="button"
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
							onClick={addListing}>
							Add Listing
						</button>

						<div className="flex justify-end space-x-2 mt-4">
							<button
								type="button"
								className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								onClick={resetForm}>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-500">
								{editingInternship ? "Update" : "Add"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
};

export default SemestralInternshipTab;
