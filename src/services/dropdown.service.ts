export const getEnabledDepartments = async () => {
	try {
		const response = await fetch(
			"http://localhost:3000/api/dropdowns/departments"
		);
		if (!response.ok) throw new Error("Failed to fetch departments");
		return await response.json();
	} catch (error) {
		console.error("Error fetching enabled departments:", error);
		throw error;
	}
};

export const getIndustries = async () => {
	try {
		const response = await fetch(
			"http://localhost:3000/api/dropdowns/industries"
		);
		if (!response.ok) throw new Error("Failed to fetch industries");
		return await response.json();
	} catch (error) {
		console.error("Error fetching industries:", error);
		throw error;
	}
};

export const getOJTCoordinators = async () => {
	try {
		const response = await fetch(
			"http://localhost:3000/api/dropdowns/ojt-coordinators"
		);
		if (!response.ok) throw new Error("Failed to fetch ojt coordinators");
		return await response.json();
	} catch (error) {
		console.error("Error fetching ojt coordinators:", error);
		throw error;
	}
};

export const getPrograms = async () => {
	try {
		const response = await fetch("http://localhost:3000/api/dropdowns/programs");
		if (!response.ok) throw new Error("Failed to fetch programs");
		return await response.json();
	} catch (error) {
		console.error("Error fetching programs:", error);
		throw error;
	}
};

export const getLocations = async () => {
	try {
		const response = await fetch("http://localhost:3000/api/dropdowns/locations");
		if (!response.ok) throw new Error("Failed to fetch locations");
		return await response.json();
	} catch (error) {
		console.error("Error fetching locations:", error);
		throw error;
	}
};