const API_BASE = "http://ec2-47-128-242-59.ap-southeast-1.compute.amazonaws.com:3000/api/ojt-requirements";

// Helper for JSON requests
const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	// Only set Content-Type if body is JSON
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

// Get all requirements with optional search and type filter
export const getOJTRequirements = async (search?: string, type?: string) => {
	const params = new URLSearchParams();
	if (search) params.append("search", search);
	if (type) params.append("type", type);

	const url = `${API_BASE}?${params.toString()}`;
	const data = await request(url);
	return data.data || [];
};

// Create a new requirement (with PDF)
export const createOJTRequirement = async (payload: FormData) => {
	const data = await request(API_BASE, {
		method: "POST",
		body: payload,
	});
	return data;
};

// Update requirement
export const updateOJTRequirement = async (id: string, payload: FormData) => {
	const data = await request(`${API_BASE}/${id}`, {
		method: "PUT",
		body: payload,
	});
	return data;
};

// Toggle status
export const toggleOJTRequirementStatus = async (id: string) => {
	const data = await request(`${API_BASE}/${id}/status`, {
		method: "PATCH",
	});
	return data;
};
