const API_BASE = "http://localhost:3000/api/semestral-internships";

// Generic helper for JSON requests
const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	// Only set Content-Type if body is JSON
	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	try {
		const res = await fetch(url, { headers, ...options });
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			throw new Error(data.message || "API request failed");
		}

		return data;
	} catch (err: any) {
		throw new Error(err.message || "Network error");
	}
};

// Get all internships
export const getSemestralInternships = async () => {
	const data = await request(API_BASE);
	return data || [];
};

// Create a new internship
export const createSemestralInternship = async (payload: any) => {
	const data = await request(API_BASE, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return data;
};

// Update internship
export const updateSemestralInternship = async (
	id: string | number,
	payload: any
) => {
	const data = await request(`${API_BASE}/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
	return data;
};

// Toggle internship status
export const toggleSemestralInternshipStatus = async (id: string | number) => {
	const data = await request(`${API_BASE}/toggle-status/${id}`, {
		method: "PATCH",
	});
	return data;
};
