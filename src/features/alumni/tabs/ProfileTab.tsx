import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAlumniProfile, updateAlumniProfile } from "../../../services/alumni.service";

const ProfileTab = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [profile, setProfile] = useState<any>(null);
	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		contact_number: "",
		current_position: "",
		company_name: "",
		linked_in_url: "",
	});

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const data = await getAlumniProfile();
			setProfile(data);
			setFormData({
				first_name: data.first_name || "",
				middle_name: data.middle_name || "",
				last_name: data.last_name || "",
				contact_number: data.contact_number || "",
				current_position: data.current_position || "",
				company_name: data.company_name || "",
				linked_in_url: data.linked_in_url || "",
			});
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load profile",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			const payload = new FormData();
			Object.entries(formData).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					payload.append(key, value);
				}
			});
			await updateAlumniProfile(payload);
			Swal.fire({
				icon: "success",
				title: "Profile Updated",
				text: "Your alumni profile has been updated.",
				timer: 2000,
				showConfirmButton: false,
			});
			fetchProfile();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to update profile",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading...</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				Unable to load profile information.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h2 className="text-2xl poppins-semibold text-gray-800 mb-4">Profile</h2>

			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">Email</label>
						<p className="text-lg poppins-regular text-gray-800">
							{profile.User?.email || "N/A"}
						</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">Role</label>
						<p className="text-lg poppins-regular text-gray-800">Alumni</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">Status</label>
						<p className="text-lg poppins-regular text-gray-800">
							{profile.User?.status === "enabled" ? "Active" : "Pending Validation"}
						</p>
					</div>
					{profile.verified_at && (
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Verified At
							</label>
							<p className="text-lg poppins-regular text-gray-800">
								{new Date(profile.verified_at).toLocaleDateString()}
							</p>
						</div>
					)}
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								First Name
							</label>
							<input
								value={formData.first_name}
								onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Middle Name
							</label>
							<input
								value={formData.middle_name}
								onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Last Name
							</label>
							<input
								value={formData.last_name}
								onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Contact Number
							</label>
							<input
								value={formData.contact_number}
								onChange={(e) =>
									setFormData({ ...formData, contact_number: e.target.value })
								}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								LinkedIn URL
							</label>
							<input
								value={formData.linked_in_url}
								onChange={(e) =>
									setFormData({ ...formData, linked_in_url: e.target.value })
								}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Current Position
							</label>
							<input
								value={formData.current_position}
								onChange={(e) =>
									setFormData({ ...formData, current_position: e.target.value })
								}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Company
							</label>
							<input
								value={formData.company_name}
								onChange={(e) =>
									setFormData({ ...formData, company_name: e.target.value })
								}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={saving}
							className="px-6 py-3 bg-green-500 text-white rounded-lg poppins-medium hover:bg-green-600 transition disabled:bg-gray-300">
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfileTab;