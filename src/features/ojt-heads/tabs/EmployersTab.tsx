import { useState, useEffect } from "react";
import { getIndustries } from "../../../services/dropdown.service";
import Modal from "../modal/Modal";
import {
	createEmployer,
	getEmployers,
	toggleEmployerStatus,
	updateEmployer,
} from "../../../services/employee.service";

const EmployerTabs = () => {
	const [employers, setEmployers] = useState<any[]>([]);
	const [industries, setIndustries] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingEmployer, setEditingEmployer] = useState<any>(null);
	const [formData, setFormData] = useState<any>({
		company_name: "",
		industry_id: "",
		contact_email: "",
		moa_file: null,
		signed_date: "",
		expiration_date: "",
	});

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

	// Submit form
	const handleSubmit = async (e: any) => {
		e.preventDefault();
		try {
			const payload = new FormData();
			payload.append("company_name", formData.company_name);
			payload.append("industry_id", formData.industry_id);
			payload.append("contact_email", formData.contact_email);
			payload.append("signed_date", formData.signed_date);
			payload.append("expiration_date", formData.expiration_date);
			if (formData.moa_file) payload.append("moa_file", formData.moa_file);

			if (editingEmployer) {
				await updateEmployer(editingEmployer.employer_id, payload);
			} else {
				await createEmployer(payload);
			}

			setShowModal(false);
			setEditingEmployer(null);
			setFormData({
				company_name: "",
				industry_id: "",
				contact_email: "",
				moa_file: null,
				signed_date: "",
				expiration_date: "",
			});
			fetchEmployers();
		} catch (error) {
			console.error(error);
		}
	};

	// Edit employer
	const handleEdit = (employer: any) => {
		setEditingEmployer(employer);
		setFormData({
			company_name: employer.company_name,
			industry_id: employer.industry_id,
			contact_email: employer.contact_email,
			moa_file: null,
			signed_date: employer.moa?.signed_date?.split("T")[0] || "",
			expiration_date: employer.moa?.expiration_date?.split("T")[0] || "",
		});
		setShowModal(true);
	};

	// Toggle status
	const handleToggleStatus = async (employer: any) => {
		try {
			await toggleEmployerStatus(employer.employer_id);
			fetchEmployers();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div>
			<h2 className="text-xl poppins-semibold mb-2">Employers</h2>

			<button
				className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
				onClick={() => setShowModal(true)}>
				Add Employer
			</button>

			{loading ? (
				<div className="flex justify-center items-center py-10">
					<p className="text-gray-500 poppins-regular">Loading employers...</p>
				</div>
			) : employers.length === 0 ? (
				<div className="text-center py-10 text-gray-500 poppins-regular">
					No employers found.
				</div>
			) : (
				<div className="overflow-x-auto bg-white">
					<table className="min-w-full border-collapse text-sm">
						<thead className="bg-green-500 text-white poppins-semibold">
							<tr>
								<th className="px-4 py-3 text-left">Company Name</th>
								<th className="px-4 py-3 text-left">Industry</th>
								<th className="px-4 py-3 text-left">Email</th>
								<th className="px-4 py-3 text-left">Signed Date</th>
								<th className="px-4 py-3 text-left">Expiration Date</th>
								<th className="px-4 py-3 text-left">MOA Document</th>{" "}
								{/* New column */}
								<th className="px-4 py-3 text-center">Status</th>
								<th className="px-4 py-3 text-center">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
							{employers.map((emp: any, index: number) => (
								<tr
									key={emp.employer_id}
									className={`${
										index % 2 === 0 ? "bg-gray-50" : "bg-white"
									} hover:bg-blue-50 transition-colors border-b`}>
									<td className="px-4 py-3">{emp.company_name}</td>
									<td className="px-4 py-3">
										{industries.find(
											(i: any) => i.industry_id === emp.industry_id
										)?.industry_name || "N/A"}
									</td>
									<td className="px-4 py-3">{emp.contact_email || "N/A"}</td>
									<td className="px-4 py-3">
										{emp.moas && emp.moas.length > 0 ? (
											<a
												href={emp.moas[0].document_url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline">
												Open MOA
											</a>
										) : (
											"N/A"
										)}
									</td>
									<td className="px-4 py-3">
										{emp.moas?.[0]?.signed_date?.split("T")[0] || "N/A"}
									</td>
									<td className="px-4 py-3">
										{emp.moas?.[0]?.expiration_date?.split("T")[0] || "N/A"}
									</td>

									<td className="px-4 py-3 text-center">
										<span
											className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
												emp.status === "enabled"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}>
											{emp.status === "enabled" ? "Published" : "Archived"}
										</span>
									</td>
									<td className="px-4 py-3 text-center space-x-2">
										<button
											className="px-3 py-1 bg-yellow-400 text-white text-sm rounded poppins-medium hover:bg-yellow-500 transition"
											onClick={() => handleEdit(emp)}>
											Edit
										</button>
										<button
											className={`px-3 py-1 text-sm rounded poppins-medium text-white transition ${
												emp.status === "enabled"
													? "bg-red-500 hover:bg-red-600"
													: "bg-green-500 hover:bg-green-600"
											}`}
											onClick={() => handleToggleStatus(emp)}>
											{emp.status === "enabled" ? "Disable" : "Enable"}
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
						{editingEmployer ? "Edit Employer" : "Add Employer"}
					</h3>
					<form onSubmit={handleSubmit} className="space-y-3">
						<input
							type="text"
							placeholder="Company Name"
							className="w-full p-2 border rounded"
							value={formData.company_name}
							onChange={(e) =>
								setFormData({ ...formData, company_name: e.target.value })
							}
							required
						/>

						<input
							type="email"
							placeholder="Contact Email"
							className="w-full p-2 border rounded"
							value={formData.contact_email}
							onChange={(e) =>
								setFormData({ ...formData, contact_email: e.target.value })
							}
							required
						/>

						<select
							className="w-full p-2 border rounded"
							value={formData.industry_id}
							onChange={(e) =>
								setFormData({ ...formData, industry_id: e.target.value })
							}
							required>
							<option value="">Select Industry</option>
							{industries.map((ind: any) => (
								<option key={ind.industry_id} value={ind.industry_id}>
									{ind.industry_name}
								</option>
							))}
						</select>

						<input
							type="file"
							accept="application/pdf"
							onChange={(e: any) =>
								setFormData({ ...formData, moa_file: e.target.files[0] })
							}
						/>

						<div className="flex space-x-2">
							<input
								type="date"
								className="w-1/2 p-2 border rounded"
								value={formData.signed_date}
								onChange={(e) =>
									setFormData({ ...formData, signed_date: e.target.value })
								}
								required
							/>
							<input
								type="date"
								className="w-1/2 p-2 border rounded"
								value={formData.expiration_date}
								onChange={(e) =>
									setFormData({ ...formData, expiration_date: e.target.value })
								}
								required
							/>
						</div>

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
								{editingEmployer ? "Update" : "Add"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
};

export default EmployerTabs;
