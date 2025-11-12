const API_BASE = "http://localhost:3000/api/sections"; // Adjust to your backend

const request = async (url: string, options: RequestInit = {}) => {
	const res = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("authToken")}`,
		},
		...options,
	});

	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "API request failed");
	}

	return res.json();
};

// Get all sections
export const getSections = async () => {
	const data = await request(`${API_BASE}`);
	return data.data || [];
};

// Get sections by department (via OJT coordinator)
export const getSectionsByCoordinator = async (coordinatorId: number) => {
	const data = await request(`${API_BASE}/by-coordinator/${coordinatorId}`);
	return data;
};
