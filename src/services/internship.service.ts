const API_BASE = "http://ec2-47-128-242-59.ap-southeast-1.compute.amazonaws.com:3000/api/internships";

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

