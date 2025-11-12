const API_BASE = "http://ec2-47-128-242-59.ap-southeast-1.compute.amazonaws.com:3000/api/student-requirements";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	// Don't set Content-Type for FormData (browser will set it with boundary)
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

export interface StudentRequirement {
	ojt_requirement_id: number;
	requirement_name: string;
	type: string;
	document_url: string | null;
	student_requirement_id: number | null;
	submitted_document_url: string | null;
	status: "not_complied" | "complied" | "approved" | "need_for_resubmission";
	remarks: string | null;
	reviewed_by: number | null;
	reviewed_at: string | null;
	reviewer: {
		ojt_coordinator_id: number;
		first_name: string;
		last_name: string;
	} | null;
}

export interface MissingRequirement {
	ojt_requirement_id: number;
	requirement_name: string;
	status: string;
}

export interface StudentRequirementsData {
	requirements: StudentRequirement[];
	allApproved: boolean;
	missingRequirements: MissingRequirement[];
	currentStatus: string;
	requirementType: "pre-ojt" | "post-ojt";
}

// Get all requirements for a student's internship
export const getStudentRequirements = async (
	studentInternshipId: number
): Promise<StudentRequirementsData> => {
	const data = await request(`${API_BASE}/student-internship/${studentInternshipId}`);
	return data.data;
};

// Submit or update a requirement
export const submitStudentRequirement = async (
	studentInternshipId: number,
	ojtRequirementId: number,
	file: File
): Promise<any> => {
	const formData = new FormData();
	formData.append("file", file);

	const data = await request(
		`${API_BASE}/student-internship/${studentInternshipId}/requirement/${ojtRequirementId}`,
		{
			method: "POST",
			body: formData,
		}
	);
	return data.data;
};

// Start OJT (change status to ongoing)
export const startOJT = async (studentInternshipId: number): Promise<any> => {
	const data = await request(
		`${API_BASE}/student-internship/${studentInternshipId}/start-ojt`,
		{
			method: "POST",
		}
	);
	return data.data;
};

// Finalize post-OJT (change status to completed)
export const finalizePostOJT = async (studentInternshipId: number): Promise<any> => {
	const data = await request(
		`${API_BASE}/student-internship/${studentInternshipId}/finalize-post-ojt`,
		{
			method: "POST",
		}
	);
	return data.data;
};

// Review a requirement (coordinator only)
export const reviewRequirement = async (
	studentRequirementId: number,
	status: "approved" | "need_for_resubmission",
	remarks?: string
): Promise<any> => {
	const data = await request(`${API_BASE}/${studentRequirementId}/review`, {
		method: "PATCH",
		body: JSON.stringify({
			status,
			remarks: remarks || null,
		}),
	});
	return data.data;
};

