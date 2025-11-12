const API_BASE = "http://localhost:3000/api/job-placement";

const request = async (url: string, options: RequestInit = {}) => {
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

export const getDashboardStats = async () => {
	const data = await request(`${API_BASE}/dashboard`);
	return data.data;
};

export const getJobApprovals = async (status?: string) => {
	const params = new URLSearchParams();
	if (status) {
		params.append("status", status);
	}
	const query = params.toString() ? `?${params.toString()}` : "";
	const data = await request(`${API_BASE}/jobs${query}`);
	return data.data || [];
};

export const getAlumni = async () => {
	const data = await request(`${API_BASE}/alumni`);
	return data.data || [];
};

export const updateAlumniStatus = async (userId: number, status: "enabled" | "disabled") => {
	const data = await request(`${API_BASE}/alumni/${userId}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});
	return data.data;
};

