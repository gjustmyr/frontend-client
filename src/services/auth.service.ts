const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authUser = async (loginCredentials: any) => {
	const response = await fetch(`${API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(loginCredentials),
	});
	const data = await response.json();
	if (!response.ok) {
		// Throw backend message directly
		throw new Error(data.message || "Something went wrong.");
	}
	return data;
};
