const API_BASE = "http://localhost:3000/api/alumni";

export const registerAlumni = async (payload: {
	first_name: string;
	middle_name?: string;
	last_name: string;
	email: string;
	password: string;
	contact_number?: string;
	current_position?: string;
	company_name?: string;
	linked_in_url?: string;
}) => {
	const response = await fetch(`${API_BASE}/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Registration failed");
	}
	return data.data;
};

const authorizedRequest = async (url: string, options: RequestInit = {}) => {
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
	return data.data;
};

export const getAlumniProfile = async () => {
	return authorizedRequest(`${API_BASE}/profile`);
};

export const updateAlumniProfile = async (formData: FormData) => {
	const token = localStorage.getItem("authToken");
	const response = await fetch(`${API_BASE}/profile`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Failed to update profile");
	}
	return data.data;
};

