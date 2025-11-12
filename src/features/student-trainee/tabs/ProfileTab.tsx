import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getCurrentProfile, updateCurrentProfile, type StudentTraineeProfile } from "../../../services/student-trainee.service";
import { getSkills, createOrGetSkill } from "../../../services/skill.service";
import QuillEditor from "../../../components/QuillEditor";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";

const ProfileTab = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(false);
	const [profile, setProfile] = useState<StudentTraineeProfile | null>(null);
	const [skills, setSkills] = useState<any[]>([]);
	const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
	const [newSkillName, setNewSkillName] = useState("");
	const [profilePicture, setProfilePicture] = useState<File | null>(null);
	const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		prefix_name: "",
		suffix_name: "",
		about: "",
		age: "",
		sex: "male" as "male" | "female",
		height: "",
		weight: "",
		complexion: "",
		birthday: "",
		birthplace: "",
		citizenship: "",
		civil_status: "single" as "single" | "married" | "widowed" | "separated",
		street_address: "",
		barangay_address: "",
		city_address: "",
		province_address: "",
	});

	const fetchProfile = async () => {
		setLoading(true);
		try {
			const data = await getCurrentProfile();
			setProfile(data);
			setFormData({
				first_name: data.first_name || "",
				middle_name: data.middle_name || "",
				last_name: data.last_name || "",
				prefix_name: data.prefix_name || "",
				suffix_name: data.suffix_name || "",
				about: data.about || "",
				age: data.age?.toString() || "",
				sex: data.sex || "male",
				height: data.height || "",
				weight: data.weight || "",
				complexion: data.complexion || "",
				birthday: data.birthday || "",
				birthplace: data.birthplace || "",
				citizenship: data.citizenship || "",
				civil_status: data.civil_status || "single",
				street_address: data.street_address || "",
				barangay_address: data.barangay_address || "",
				city_address: data.city_address || "",
				province_address: data.province_address || "",
			});
			if (data.user?.profile_picture) {
				setProfilePicturePreview(data.user.profile_picture);
			}
			if (data.StudentSkills) {
				setSelectedSkillIds(data.StudentSkills.map((ss) => ss.skill.skill_id));
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

	const fetchSkills = async () => {
		try {
			const data = await getSkills();
			setSkills(data);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchProfile();
		fetchSkills();
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

			// Append skill_ids as array items for FormData
			if (selectedSkillIds.length > 0) {
				selectedSkillIds.forEach((skillId) => {
					payload.append("skill_ids[]", skillId.toString());
				});
			}

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
		if (profile) {
			setFormData({
				first_name: profile.first_name || "",
				middle_name: profile.middle_name || "",
				last_name: profile.last_name || "",
				prefix_name: profile.prefix_name || "",
				suffix_name: profile.suffix_name || "",
				about: profile.about || "",
				age: profile.age?.toString() || "",
				sex: profile.sex || "male",
				height: profile.height || "",
				weight: profile.weight || "",
				complexion: profile.complexion || "",
				birthday: profile.birthday || "",
				birthplace: profile.birthplace || "",
				citizenship: profile.citizenship || "",
				civil_status: profile.civil_status || "single",
				street_address: profile.street_address || "",
				barangay_address: profile.barangay_address || "",
				city_address: profile.city_address || "",
				province_address: profile.province_address || "",
			});
			setProfilePicturePreview(profile.user?.profile_picture || "");
			if (profile.StudentSkills) {
				setSelectedSkillIds(profile.StudentSkills.map((ss) => ss.skill.skill_id));
			}
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
				<p className="poppins-regular">No profile found</p>
			</div>
		);
	}

	const fullName = `${profile.prefix_name ? `${profile.prefix_name} ` : ""}${profile.first_name}${profile.middle_name ? ` ${profile.middle_name}` : ""} ${profile.last_name}${profile.suffix_name ? ` ${profile.suffix_name}` : ""}`.trim();

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
											<span className="text-4xl text-gray-400 poppins-semibold">
												{profile.first_name?.charAt(0).toUpperCase() || "S"}
											</span>
										</div>
									)}
								</div>
							</div>
							<div className="flex-1 text-white">
								<h1 className="text-3xl poppins-bold mb-2">{fullName}</h1>
								<p className="text-green-100 text-lg">Student Trainee</p>
								<p className="text-green-100 mt-1">{profile.user?.email || ""}</p>
							</div>
							<button
								onClick={() => setEditing(true)}
								className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors poppins-semibold shadow-lg flex items-center gap-2">
								<FiEdit2 size={20} />
								Edit Profile
							</button>
						</div>
					</div>

					{/* Profile Information */}
					<div className="p-8">
						{/* About Section */}
						{profile.about && (
							<div className="mb-6">
								<h2 className="text-xl poppins-semibold mb-3 text-gray-800">ABOUT</h2>
								<p className="text-gray-700 poppins-regular leading-relaxed">{profile.about}</p>
							</div>
						)}

						{/* Skills Section */}
						{profile.StudentSkills && profile.StudentSkills.length > 0 && (
							<div className="mb-6">
								<h2 className="text-xl poppins-semibold mb-3 text-gray-800">SKILLS</h2>
								<div className="flex flex-wrap gap-2">
									{profile.StudentSkills.map((studentSkill) => (
										<span
											key={studentSkill.student_skill_id}
											className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm poppins-medium">
											{studentSkill.skill.skill_name}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Personal Information */}
						<h2 className="text-xl poppins-semibold mb-4 text-gray-800 border-b pb-3">
							Personal Information
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Age</label>
								<p className="text-gray-800 poppins-regular">{profile.age || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Sex</label>
								<p className="text-gray-800 poppins-regular capitalize">{profile.sex || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Birthday</label>
								<p className="text-gray-800 poppins-regular">
									{profile.birthday
										? new Date(profile.birthday).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
										  })
										: "N/A"}
								</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Birthplace</label>
								<p className="text-gray-800 poppins-regular">{profile.birthplace || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Citizenship</label>
								<p className="text-gray-800 poppins-regular">{profile.citizenship || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Civil Status</label>
								<p className="text-gray-800 poppins-regular capitalize">{profile.civil_status || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Height</label>
								<p className="text-gray-800 poppins-regular">{profile.height || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Weight</label>
								<p className="text-gray-800 poppins-regular">{profile.weight || "N/A"}</p>
							</div>
							<div>
								<label className="text-sm font-semibold text-gray-600 block mb-1">Complexion</label>
								<p className="text-gray-800 poppins-regular">{profile.complexion || "N/A"}</p>
							</div>
							<div className="md:col-span-2">
								<label className="text-sm font-semibold text-gray-600 block mb-1">Address</label>
								<p className="text-gray-800 poppins-regular">
									{[
										profile.street_address,
										profile.barangay_address,
										profile.city_address,
										profile.province_address,
									]
										.filter(Boolean)
										.join(", ") || "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Mode */}
			{editing && (
				<div className="bg-white rounded-xl shadow-lg p-8">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl poppins-semibold text-gray-800">Edit Profile</h2>
						<button
							onClick={handleCancel}
							className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
							<FiX size={24} />
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Profile Picture */}
						<div>
							<label className="block text-sm font-medium mb-2 poppins-medium">Profile Picture</label>
							<div className="flex items-center gap-4">
								<div className="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-200">
									{profilePicturePreview ? (
										<img
											src={profilePicturePreview}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<span className="text-2xl text-gray-400">
												{formData.first_name?.charAt(0).toUpperCase() || "S"}
											</span>
										</div>
									)}
								</div>
								<input
									type="file"
									accept="image/*"
									onChange={handleProfilePictureChange}
									className="text-sm poppins-regular"
								/>
							</div>
						</div>

						{/* Name Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Prefix</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.prefix_name}
									onChange={(e) => setFormData({ ...formData, prefix_name: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">First Name *</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.first_name}
									onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Middle Name</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.middle_name}
									onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Last Name *</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.last_name}
									onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Suffix</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.suffix_name}
									onChange={(e) => setFormData({ ...formData, suffix_name: e.target.value })}
								/>
							</div>
						</div>

						{/* About */}
						<div>
							<label className="block text-sm font-medium mb-1 poppins-medium">About</label>
							<QuillEditor
								value={formData.about}
								onChange={(value) => setFormData({ ...formData, about: value })}
								placeholder="Tell us about yourself..."
								className="bg-white"
							/>
						</div>

						{/* Personal Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Age</label>
								<input
									type="number"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.age}
									onChange={(e) => setFormData({ ...formData, age: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Sex *</label>
								<select
									className="w-full p-2 border rounded poppins-regular"
									value={formData.sex}
									onChange={(e) => setFormData({ ...formData, sex: e.target.value as "male" | "female" })}
									required>
									<option value="male">Male</option>
									<option value="female">Female</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Birthday</label>
								<input
									type="date"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.birthday}
									onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Birthplace</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.birthplace}
									onChange={(e) => setFormData({ ...formData, birthplace: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Citizenship</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.citizenship}
									onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Civil Status *</label>
								<select
									className="w-full p-2 border rounded poppins-regular"
									value={formData.civil_status}
									onChange={(e) =>
										setFormData({
											...formData,
											civil_status: e.target.value as "single" | "married" | "widowed" | "separated",
										})
									}
									required>
									<option value="single">Single</option>
									<option value="married">Married</option>
									<option value="widowed">Widowed</option>
									<option value="separated">Separated</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Height</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.height}
									onChange={(e) => setFormData({ ...formData, height: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Weight</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.weight}
									onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Complexion</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.complexion}
									onChange={(e) => setFormData({ ...formData, complexion: e.target.value })}
								/>
							</div>
						</div>

						{/* Address */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Street Address</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.street_address}
									onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Barangay</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.barangay_address}
									onChange={(e) => setFormData({ ...formData, barangay_address: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">City</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.city_address}
									onChange={(e) => setFormData({ ...formData, city_address: e.target.value })}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 poppins-medium">Province</label>
								<input
									type="text"
									className="w-full p-2 border rounded poppins-regular"
									value={formData.province_address}
									onChange={(e) => setFormData({ ...formData, province_address: e.target.value })}
								/>
							</div>
						</div>

						{/* Skills */}
						<div>
							<label className="block text-sm font-medium mb-2 poppins-medium">Skills</label>
							<div className="flex gap-2 mb-3">
								<input
									type="text"
									placeholder="Enter skill name..."
									className="flex-1 p-2 border rounded poppins-regular"
									value={newSkillName}
									onChange={(e) => setNewSkillName(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddSkill();
										}
									}}
								/>
								<button
									type="button"
									onClick={handleAddSkill}
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 poppins-medium">
									Add Skill
								</button>
							</div>
							<div className="border rounded p-3 max-h-40 overflow-y-auto">
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
							</div>
							{selectedSkillIds.length > 0 && (
								<p className="text-sm text-gray-600 poppins-regular mt-2">
									Selected: {selectedSkillIds.length} skill(s)
								</p>
							)}
						</div>

						{/* Submit Buttons */}
						<div className="flex justify-end gap-3 pt-4 border-t">
							<button
								type="button"
								onClick={handleCancel}
								className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 poppins-medium flex items-center gap-2">
								<FiX size={18} />
								Cancel
							</button>
							<button
								type="submit"
								disabled={saving}
								className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 poppins-medium flex items-center gap-2">
								<FiSave size={18} />
								{saving ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default ProfileTab;

