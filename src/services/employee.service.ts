const API_BASE = "http://localhost:3000/api/employers";

// Helper function for API requests
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

// Get all employers
export const getEmployers = async () => {
	const data = await request(API_BASE);
	return data.data || [];
};

// Create a new employer (with MOA PDF)
export const createEmployer = async (payload: FormData) => {
	const data = await request(API_BASE, {
		method: "POST",
		body: payload,
	});
	return data;
};

// Update employer info (with optional MOA PDF)
export const updateEmployer = async (id: string, payload: FormData) => {
	const data = await request(`${API_BASE}/${id}`, {
		method: "PUT",
		body: payload,
	});
	return data;
};

// Enable or disable employer
export const toggleEmployerStatus = async (id: string) => {
	const data = await request(`${API_BASE}/${id}/status`, {
		method: "PATCH",
	});
	return data;
};
