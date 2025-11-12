import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getCurrentProfile, updateCurrentProfile } from "../../../services/employer.service";
import { getIndustries } from "../../../services/dropdown.service";
import QuillEditor from "../../../components/QuillEditor";

const ProfileTab = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(false);
	const [industries, setIndustries] = useState<any[]>([]);
	const [profile, setProfile] = useState<any>(null);
	const [formData, setFormData] = useState({
		company_name: "",
		company_overview: "",
		contact_person: "",
		contact_email: "",
		contact_phone: "",
		street_address: "",
		city_address: "",
		province_address: "",
		postal_code: "",
		website_url: "",
		working_hours_start: "",
		working_hours_end: "",
		industry_id: "",
	});
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");

	const fetchProfile = async () => {
		setLoading(true);
		try {
			const data = await getCurrentProfile();
			setProfile(data);
			setFormData({
				company_name: data.company_name || "",
				company_overview: data.company_overview || "",
				contact_person: data.contact_person || "",
				contact_email: data.contact_email || "",
				contact_phone: data.contact_phone || "",
				street_address: data.street_address || "",
				city_address: data.city_address || "",
				province_address: data.province_address || "",
				postal_code: data.postal_code || "",
				website_url: data.website_url || "",
				working_hours_start: data.working_hours_start || "",
				working_hours_end: data.working_hours_end || "",
				industry_id: data.industry_id || "",
			});
			if (data.user?.profile_picture) {
				setProfilePicturePreview(data.user.profile_picture);
			}
		} catch (err) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Failed to load profile",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchIndustries = async () => {
		try {
			const data = await getIndustries();
			setIndustries(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchProfile();
		fetchIndustries();
	}, []);

	const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setProfilePicture(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicturePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		try {
			const payload = new FormData();
			Object.keys(formData).forEach((key) => {
				const value = formData[key as keyof typeof formData];
				if (value !== undefined && value !== null && value !== "") {
					payload.append(key, value as string);
				}
			});

			if (profilePicture) {
				payload.append("profile_picture", profilePicture);
			}

			await updateCurrentProfile(payload);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Profile updated successfully",
				timer: 2000,
				showConfirmButton: false,
			});
			setEditing(false);
			setProfilePicture(null);
			fetchProfile();
		} catch (err: any) {
			console.error(err);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: err.message || "Failed to update profile",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setEditing(false);
		setProfilePicture(null);
		// Reset form data to original profile data
		if (profile) {
			setFormData({
				company_name: profile.company_name || "",
				company_overview: profile.company_overview || "",
				contact_person: profile.contact_person || "",
				contact_email: profile.contact_email || "",
				contact_phone: profile.contact_phone || "",
				street_address: profile.street_address || "",
				city_address: profile.city_address || "",
				province_address: profile.province_address || "",
				postal_code: profile.postal_code || "",
				website_url: profile.website_url || "",
				working_hours_start: profile.working_hours_start || "",
				working_hours_end: profile.working_hours_end || "",
				industry_id: profile.industry_id || "",
			});
			setProfilePicturePreview(profile.user?.profile_picture || "");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-10 text-gray-500">
				No profile found
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto">
			{/* View Mode */}
			{!editing && (
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* Header with Profile Picture */}
					<div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 relative">
						<div className="flex items-center gap-6">
							<div className="relative">
								<div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
									{profilePicturePreview ? (
										<img
											src={profilePicturePreview}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gray-300">
											<svg
												className="w-16 h-16 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
										</div>
									)}
								</div>
							</div>
							<div className="flex-1 text-white">
								<h1 className="text-3xl poppins-bold mb-2">
									{profile.company_name || "Company Name"}
								</h1>
								<p className="text-green-100 text-lg">
									{profile.industry?.industry_name || "Industry"}
								</p>
								<p className="text-green-100 mt-1">
									{profile.user?.email || ""}
								</p>
							</div>
							<button
								onClick={() => setEditing(true)}
								className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors poppins-semibold shadow-lg flex items-center gap-2">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
								Edit Profile
							</button>
						</div>
					</div>

					{/* Company Information */}
					<div className="p-8">
						<h2 className="text-2xl poppins-semibold mb-6 text-gray-800 border-b pb-3">
							Company Information
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Company Name
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.company_name || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Industry
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.industry?.industry_name || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Contact Person
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.contact_person || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Email
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.contact_email || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Phone
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.contact_phone || "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Website
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.website_url ? (
										<a
											href={profile.website_url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline">
											{profile.website_url}
										</a>
									) : (
										"N/A"
									)}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Working Hours
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.working_hours_start && profile.working_hours_end
										? `${profile.working_hours_start} - ${profile.working_hours_end}`
										: "N/A"}
								</p>
							</div>

							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Postal Code
								</label>
								<p className="text-gray-800 poppins-regular">
									{profile.postal_code || "N/A"}
								</p>
							</div>

							<div className="md:col-span-2">
								<label className="text-sm font-semibold text-gray-600 block mb-1">
									Address
								</label>
								<p className="text-gray-800 poppins-regular">
									{[
										profile.street_address,
										profile.city_address,
										profile.province_address,
									]
										.filter(Boolean)
										.join(", ") || "N/A"}
								</p>
							</div>

							{profile.company_overview && (
								<div className="md:col-span-2">
									<label className="text-sm font-semibold text-gray-600 block mb-1">
										Company Overview
									</label>
									<div
										className="text-gray-800 poppins-regular leading-relaxed prose max-w-none"
										dangerouslySetInnerHTML={{ __html: profile.company_overview }}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Edit Mode */}
			{editing && (
				<div className="bg-white rounded-xl shadow-lg p-8">
					<h2 className="text-2xl poppins-semibold mb-6 text-gray-800">
						Edit Company Profile
					</h2>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Profile Picture Upload */}
						<div className="flex items-center gap-6 mb-6">
							<div className="relative">
								<div className="w-32 h-32 rounded-full border-4 border-green-500 shadow-lg overflow-hidden bg-gray-200">
									{profilePicturePreview ? (
										<img
											src={profilePicturePreview}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gray-300">
											<svg
												className="w-16 h-16 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
										</div>
									)}
								</div>
								<label className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors shadow-lg">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<input
										type="file"
										accept="image/*"
										onChange={handleProfilePictureChange}
										className="hidden"
									/>
								</label>
							</div>
							<div>
								<p className="text-sm text-gray-600 poppins-medium mb-1">
									Profile Picture
								</p>
								<p className="text-xs text-gray-500">
									Click the camera icon to change your profile picture
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Company Name *
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.company_name}
									onChange={(e) =>
										setFormData({ ...formData, company_name: e.target.value })
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Industry
								</label>
								<select
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.industry_id}
									onChange={(e) =>
										setFormData({ ...formData, industry_id: e.target.value })
									}>
									<option value="">Select Industry</option>
									{industries.map((ind) => (
										<option key={ind.industry_id} value={ind.industry_id}>
											{ind.industry_name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Contact Person
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.contact_person}
									onChange={(e) =>
										setFormData({ ...formData, contact_person: e.target.value })
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Email *
								</label>
								<input
									type="email"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.contact_email}
									onChange={(e) =>
										setFormData({ ...formData, contact_email: e.target.value })
									}
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Phone
								</label>
								<input
									type="tel"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.contact_phone}
									onChange={(e) =>
										setFormData({ ...formData, contact_phone: e.target.value })
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Website
								</label>
								<input
									type="url"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.website_url}
									onChange={(e) =>
										setFormData({ ...formData, website_url: e.target.value })
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Working Hours Start
								</label>
								<input
									type="time"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.working_hours_start}
									onChange={(e) =>
										setFormData({
											...formData,
											working_hours_start: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Working Hours End
								</label>
								<input
									type="time"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.working_hours_end}
									onChange={(e) =>
										setFormData({
											...formData,
											working_hours_end: e.target.value,
										})
									}
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Street Address
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.street_address}
									onChange={(e) =>
										setFormData({ ...formData, street_address: e.target.value })
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									City
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.city_address}
									onChange={(e) =>
										setFormData({ ...formData, city_address: e.target.value })
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Province
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.province_address}
									onChange={(e) =>
										setFormData({
											...formData,
											province_address: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Postal Code
								</label>
								<input
									type="text"
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
									value={formData.postal_code}
									onChange={(e) =>
										setFormData({ ...formData, postal_code: e.target.value })
									}
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Company Overview
								</label>
								<QuillEditor
									value={formData.company_overview}
									onChange={(value) =>
										setFormData({ ...formData, company_overview: value })
									}
									placeholder="Write about your company..."
									className="mb-4"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-6 border-t">
							<button
								type="button"
								onClick={handleCancel}
								disabled={saving}
								className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors poppins-semibold">
								Cancel
							</button>
							<button
								type="submit"
								disabled={saving}
								className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors poppins-semibold flex items-center gap-2">
								{saving ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										Saving...
									</>
								) : (
									<>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Save Changes
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default ProfileTab;
