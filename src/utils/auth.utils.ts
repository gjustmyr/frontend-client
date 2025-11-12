/**
 * Decode JWT token without verification (frontend only)
 * Note: This only decodes the payload. The backend verifies the signature.
 */
export const decodeToken = (token: string): { user_id: number; email: string; role: string } | null => {
	try {
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;

		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join("")
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error("Error decoding token:", error);
		return null;
	}
};

/**
 * Get current user from token
 */
export const getCurrentUser = () => {
	const token = localStorage.getItem("authToken");
	if (!token) return null;

	return decodeToken(token);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
	const token = localStorage.getItem("authToken");
	if (!token) return false;

	const decoded = decodeToken(token);
	return decoded !== null;
};

/**
 * Map route paths to required backend roles
 */
export const getRequiredRole = (path: string): string | null => {
	const routeRoleMap: Record<string, string> = {
		"/ojt-head": "ojt-head",
		"/ojt-coordinator": "ojt-coordinator",
		"/company-representative": "employer", // Backend uses "employer" for company-representative
		"/student-trainee": "student-trainee",
		"/super-admin": "superadmin",
		"/job-placement": "job-placement-head",
		"/training-supervisor": "supervisor",
		"/alumni": "alumni",
	};

	return routeRoleMap[path] || null;
};

/**
 * Map backend role to frontend route path
 */
export const getRouteByRole = (role: string): string => {
	const roleRouteMap: Record<string, string> = {
		"ojt-head": "/ojt-head",
		"ojt-coordinator": "/ojt-coordinator",
		employer: "/company-representative",
		"student-trainee": "/student-trainee",
		superadmin: "/super-admin",
		"job-placement-head": "/job-placement",
		supervisor: "/training-supervisor",
		alumni: "/alumni",
	};

	return roleRouteMap[role] || "/";
};

