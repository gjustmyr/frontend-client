const API_BASE = "http://localhost:3000/api/student-trainees";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	const res = await fetch(url, { headers, ...options });
	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "API request failed");
	}

	return res.json();
};

export interface StudentTraineeProfile {
	student_trainee_id: number;
	first_name: string;
	middle_name: string | null;
	last_name: string;
	prefix_name: string | null;
	suffix_name: string | null;
	about: string | null;
	age: number | null;
	sex: "male" | "female";
	height: string | null;
	weight: string | null;
	complexion: string | null;
	birthday: string | null;
	birthplace: string | null;
	citizenship: string | null;
	civil_status: "single" | "married" | "widowed" | "separated";
	street_address: string | null;
	barangay_address: string | null;
	city_address: string | null;
	province_address: string | null;
	status: string;
	user?: {
		user_id: number;
		email: string;
		role: string;
		profile_picture: string | null;
	};
	StudentSkills?: Array<{
		student_skill_id: number;
		skill: {
			skill_id: number;
			skill_name: string;
			skill_description: string | null;
		};
	}>;
}

// Get current student trainee profile
export const getCurrentProfile = async (): Promise<StudentTraineeProfile> => {
	const data = await request(`${API_BASE}/profile`);
	return data.data;
};

// Update current student trainee profile
export const updateCurrentProfile = async (formData: FormData): Promise<StudentTraineeProfile> => {
	const data = await request(`${API_BASE}/profile`, {
		method: "PUT",
		body: formData,
	});
	return data.data;
};

