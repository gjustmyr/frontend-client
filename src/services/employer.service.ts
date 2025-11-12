const API_BASE = "http://localhost:3000/api/employers";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	const res = await fetch(url, { headers, ...options });
	if (!res.ok) {
		// Try to parse as JSON, fallback to text if it's HTML or other format
		let errorData;
		const contentType = res.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			try {
				errorData = await res.json();
			} catch (e) {
				errorData = { message: "Failed to parse error response" };
			}
		} else {
			const text = await res.text();
			errorData = { message: text || "API request failed" };
		}
		throw new Error(errorData.message || "API request failed");
	}

	return res.json();
};

// Get current employer profile
export const getCurrentProfile = async () => {
	const data = await request(`${API_BASE}/profile`);
	return data.data;
};

// Update current employer profile (with profile picture upload)
export const updateCurrentProfile = async (payload: FormData) => {
	const data = await request(`${API_BASE}/profile`, {
		method: "PUT",
		body: payload,
	});
	return data.data;
};

// Get all employers (for admin)
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

