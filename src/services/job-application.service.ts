const API_BASE = "http://localhost:3000/api/job-applications";

const authRequest = async (url: string, options: RequestInit = {}) => {
	const token = localStorage.getItem("authToken");
	const headers: Record<string, string> = {
		Authorization: `Bearer ${token}`,
	};

	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	const response = await fetch(url, {
		...options,
		headers,
	});
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}
	return data;
};

export const applyToJob = async (payload: {
	internship_id: number;
	cover_letter?: string;
	resume_url?: string;
}) => {
	const data = await authRequest(API_BASE, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data.data;
};

export const getMyJobApplications = async () => {
	const data = await authRequest(`${API_BASE}/my`);
	return data.data || [];
};

export const getJobApplicationsForEmployer = async (internshipId: number) => {
	const data = await authRequest(`${API_BASE}/job/${internshipId}`);
	return data.data || [];
};

export const updateJobApplicationStatus = async (
	jobApplicationId: number,
	status: string,
	notes?: string
) => {
	const data = await authRequest(`${API_BASE}/${jobApplicationId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status, notes }),
	});
	return data.data;
};

