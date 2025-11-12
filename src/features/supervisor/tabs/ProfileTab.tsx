import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
	getSupervisorProfile,
	updateSupervisorProfile,
} from "../../../services/supervisor.service";

const ProfileTab = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [profile, setProfile] = useState<any>(null);
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [profilePreview, setProfilePreview] = useState<string>("");
	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		office_department: "",
	});

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const data = await getSupervisorProfile();
			setProfile(data);
			setFormData({
				first_name: data.first_name || "",
				middle_name: data.middle_name || "",
				last_name: data.last_name || "",
				office_department: data.office_department || "",
			});
			setProfilePreview(data.User?.profile_picture || "");
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load supervisor profile",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setProfilePicture(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setSaving(true);
			const payload = new FormData();
			payload.append("first_name", formData.first_name);
			payload.append("middle_name", formData.middle_name);
			payload.append("last_name", formData.last_name);
			payload.append("office_department", formData.office_department);
			if (profilePicture) {
				payload.append("profile_picture", profilePicture);
			}
			await updateSupervisorProfile(payload);
			Swal.fire({
				icon: "success",
				title: "Profile Updated",
				text: "Your supervisor profile has been updated successfully.",
				timer: 2000,
				showConfirmButton: false,
			});
			setProfilePicture(null);
			fetchProfile();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Update Failed",
				text: error.message || "Could not update profile.",
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading profile...</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				Unable to load profile details.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h2 className="text-2xl poppins-semibold text-gray-800">Supervisor Profile</h2>

			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
				<div className="flex flex-col md:flex-row md:items-center gap-6">
					<div className="w-32 h-32 rounded-full border-4 border-green-500 overflow-hidden bg-gray-200">
						{profilePreview ? (
							<img
								src={profilePreview}
								alt="Profile"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl poppins-semibold">
								{profile.User?.email?.charAt(0).toUpperCase() || "S"}
							</div>
						)}
					</div>
					<div>
						<p className="text-lg poppins-semibold text-gray-800">
							{profile.first_name} {profile.middle_name} {profile.last_name}
						</p>
						<p className="text-sm text-gray-500 poppins-regular">
							{profile.User?.email || "N/A"}
						</p>
						<p className="text-sm text-gray-500 poppins-regular mt-2">
							Employer: {profile.Employer?.company_name || "N/A"}
						</p>
						<p className="text-sm text-gray-500 poppins-regular">
							Department: {profile.office_department || "Not specified"}
						</p>
						<div className="mt-3">
							<label className="text-sm poppins-medium text-gray-600 mb-1 block">
								Update Profile Picture
							</label>
							<input type="file" accept="image/*" onChange={handleProfilePictureChange} />
						</div>
					</div>
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
								required
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
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Office / Department
							</label>
							<input
								value={formData.office_department}
								onChange={(e) =>
									setFormData({ ...formData, office_department: e.target.value })
								}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="e.g., IT Department"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium text-gray-600 mb-1">
								Employer Contact Email
							</label>
							<p className="text-sm text-gray-700 poppins-regular">
								{profile.Employer?.contact_email || "N/A"}
							</p>
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

