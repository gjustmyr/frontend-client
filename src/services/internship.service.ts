const API_BASE = "http://localhost:3000/api/internships";

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

// Get my internships
export const getMyInternships = async () => {
	const data = await request(`${API_BASE}/my-internships`);
	return data.data || [];
};

// Create internship
export const createInternship = async (payload: {
	title: string;
	description: string;
	is_hiring: boolean;
	skill_ids?: number[];
}) => {
	const data = await request(API_BASE, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data.data;
};

// Get applications for an internship
export const getApplications = async (internshipId: number) => {
	const data = await request(`${API_BASE}/${internshipId}/applications`);
	return data.data || [];
};

// Update application status
export const updateApplicationStatus = async (
	applicationId: number,
	status: string
) => {
	const data = await request(`${API_BASE}/applications/${applicationId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
	return data.data;
};

// OJT Head: Get all internships for approval
export const getAllForApproval = async () => {
	const data = await request(`${API_BASE}/approvals`);
	return data.data || [];
};

// OJT Head: Approve or reject internship
export const updateApprovalStatus = async (
	internshipId: number,
	approvalStatus: "pending" | "approved" | "rejected"
) => {
	const data = await request(`${API_BASE}/${internshipId}/approval`, {
		method: "PATCH",
		body: JSON.stringify({ approval_status: approvalStatus }),
	});
	return data.data;
};

// Update internship
export const updateInternship = async (
	internshipId: number,
	payload: {
		title: string;
		description: string;
		is_hiring: boolean;
		skill_ids?: number[];
	}
) => {
	const data = await request(`${API_BASE}/${internshipId}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	return data.data;
};

// Delete internship
export const deleteInternship = async (internshipId: number) => {
	const data = await request(`${API_BASE}/${internshipId}`, {
		method: "DELETE",
	});
	return data;
};

// Toggle internship status (close/open)
export const toggleInternshipStatus = async (internshipId: number) => {
	const data = await request(`${API_BASE}/${internshipId}/status`, {
		method: "PATCH",
	});
	return data.data;
};

export interface InternshipRecommendation {
	internship_id: number;
	title: string;
	description: string | null;
	status: string;
	is_hiring: boolean;
	approval_status: string;
	updatedAt: string;
	employer: {
		employer_id: number;
		company_name: string;
		industry_id: number | null;
		industry: {
			industry_id: number;
			industry_name: string;
		} | null;
	} | null;
	skills: { skill_id: number; skill_name: string }[];
	matched_skills: string[];
	recommendation_score: number;
	is_recommended: boolean;
}

export const getRecommendedInternships = async (params?: { search?: string }) => {
	const query = new URLSearchParams();
	if (params?.search) {
		query.append("search", params.search);
	}

	const url = `${API_BASE}/recommendations${query.toString() ? `?${query.toString()}` : ""}`;
	const data = await request(url);
	return (data.data || []) as InternshipRecommendation[];
};

