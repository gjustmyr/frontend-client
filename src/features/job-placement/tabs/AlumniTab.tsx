import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getAlumni, updateAlumniStatus } from "../../../services/job-placement.service";
import { FiCheckCircle, FiXCircle, FiMail } from "react-icons/fi";

interface AlumniUser {
	user_id: number;
	email: string;
	status: "enabled" | "disabled";
	createdAt: string;
	Alumni?: {
		alumni_id: number;
		first_name: string;
		middle_name?: string;
		last_name: string;
		contact_number?: string;
		current_position?: string;
		company_name?: string;
		linked_in_url?: string;
		resume_url?: string;
		verified_at?: string | null;
	};
}

const AlumniTab = () => {
	const [alumni, setAlumni] = useState<AlumniUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");

	const fetchAlumni = async () => {
		try {
			setLoading(true);
			const data = await getAlumni();
			setAlumni(data);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load alumni",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAlumni();
	}, []);

	const toggleStatus = async (user: AlumniUser) => {
		const nextStatus = user.status === "enabled" ? "disabled" : "enabled";
		try {
			await updateAlumniStatus(user.user_id, nextStatus);
			Swal.fire({
				icon: "success",
				title: "Status Updated",
				text: `Alumni has been ${nextStatus === "enabled" ? "enabled" : "disabled"}.`,
				timer: 1800,
				showConfirmButton: false,
			});
			fetchAlumni();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to update alumni status",
			});
		}
	};

	const filteredAlumni = useMemo(() => {
		if (filter === "all") return alumni;
		return alumni.filter((item) => item.status === filter);
	}, [alumni, filter]);

	const getFullName = (user: AlumniUser) => {
		const parts = [
			user.Alumni?.first_name,
			user.Alumni?.middle_name,
			user.Alumni?.last_name,
		].filter(Boolean);
		return parts.length > 0 ? parts.join(" ") : "Unavailable";
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl poppins-semibold text-gray-800">Alumni Directory</h2>
					<p className="text-gray-600 poppins-regular mt-1">
						Validate alumni accounts before they can access the job portal.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600 poppins-medium">Filter:</label>
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value as "all" | "enabled" | "disabled")}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 poppins-regular text-sm">
						<option value="all">All</option>
						<option value="enabled">Active</option>
						<option value="disabled">Pending Validation</option>
					</select>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<p className="text-gray-500 poppins-regular">Loading alumni...</p>
					</div>
				) : filteredAlumni.length === 0 ? (
					<div className="text-center py-10 text-gray-500 poppins-regular">
						No alumni found for this filter.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border-collapse text-sm">
							<thead className="bg-green-500 text-white poppins-semibold">
								<tr>
									<th className="px-4 py-3 text-left">Name</th>
									<th className="px-4 py-3 text-left">Email</th>
									<th className="px-4 py-3 text-left">Current Position</th>
									<th className="px-4 py-3 text-left">Company</th>
									<th className="px-4 py-3 text-left">Status</th>
									<th className="px-4 py-3 text-center">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
								{filteredAlumni.map((user) => (
									<tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
										<td className="px-4 py-3">
											<p className="font-semibold">{getFullName(user)}</p>
											{user.Alumni?.contact_number && (
												<p className="text-xs text-gray-500">
													Contact: {user.Alumni.contact_number}
												</p>
											)}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<FiMail />
												{user.email}
											</div>
										</td>
										<td className="px-4 py-3">
											{user.Alumni?.current_position || "—"}
										</td>
										<td className="px-4 py-3">
											{user.Alumni?.company_name || "—"}
										</td>
										<td className="px-4 py-3">
											<span
												className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
													user.status === "enabled"
														? "bg-green-100 text-green-700"
														: "bg-yellow-100 text-yellow-700"
												}`}>
												{user.status === "enabled" ? "Active" : "Requires Validation"}
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											<button
												className={`inline-flex items-center gap-2 px-4 py-2 rounded poppins-medium transition ${
													user.status === "enabled"
														? "bg-red-100 text-red-600 hover:bg-red-200"
														: "bg-green-100 text-green-600 hover:bg-green-200"
												}`}
												onClick={() => toggleStatus(user)}>
												{user.status === "enabled" ? (
													<>
														<FiXCircle /> Disable
													</>
												) : (
													<>
														<FiCheckCircle /> Activate
													</>
												)}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default AlumniTab;

