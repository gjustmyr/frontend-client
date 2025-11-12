const API_BASE = "http://localhost:3000/api/job-requirements";

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

export const getJobRequirements = async (internshipId: number) => {
	const data = await authRequest(`${API_BASE}/${internshipId}`);
	return data.data;
};

export const saveJobRequirements = async (
	internshipId: number,
	requirements: Array<{
		job_requirement_id?: number;
		title: string;
		description?: string;
		is_required?: boolean;
		order?: number;
	}>
) => {
	const data = await authRequest(`${API_BASE}/${internshipId}`, {
		method: "PUT",
		body: JSON.stringify({ requirements }),
	});
	return data.data;
};

export const submitJobRequirement = async (
	jobRequirementId: number,
	formData: FormData
) => {
	const token = localStorage.getItem("authToken");
	const response = await fetch(`${API_BASE}/submit/${jobRequirementId}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}
	return data.data;
};

export const reviewRequirementSubmission = async (
	submissionId: number,
	status: "approved" | "rejected" | "submitted",
	remarks?: string
) => {
	const data = await authRequest(`${API_BASE}/submission/${submissionId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status, remarks }),
	});
	return data.data;
};

