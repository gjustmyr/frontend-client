const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getToken = () => localStorage.getItem("token");

export const apiRequest = async <T>(
	endpoint: string,
	method: string = "GET",
	body?: any
): Promise<T> => {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};

	const token = getToken();
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Something went wrong.");
	}

	return data;
};

export const apiUpload = async <T>(
	endpoint: string,
	formData: FormData,
	method: string = "POST"
): Promise<T> => {
	const headers: HeadersInit = {};

	const token = getToken();
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers,
		body: formData,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "File upload failed.");
	}

	return data;
};
