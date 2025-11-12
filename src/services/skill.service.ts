const API_BASE = "http://localhost:3000/api/skills";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

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

// Get all skills
export const getSkills = async () => {
	const data = await request(API_BASE);
	return data.data || [];
};

// Create or get skill (auto-add if not exists)
export const createOrGetSkill = async (skillName: string, skillDescription?: string) => {
	const data = await request(`${API_BASE}/create-or-get`, {
		method: "POST",
		body: JSON.stringify({
			skill_name: skillName,
			skill_description: skillDescription,
		}),
	});
	return data.data;
};

// Create a new skill
export const createSkill = async (skillName: string, skillDescription?: string) => {
	const data = await request(API_BASE, {
		method: "POST",
		body: JSON.stringify({
			skill_name: skillName,
			skill_description: skillDescription,
		}),
	});
	return data.data;
};

