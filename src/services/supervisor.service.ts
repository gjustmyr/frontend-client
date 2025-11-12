const API_BASE = "http://localhost:3000/api/supervisors";

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

export const getSupervisorProfile = async () => {
	return authorizedRequest(`${API_BASE}/profile`);
};

export const updateSupervisorProfile = async (formData: FormData) => {
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

export const getSupervisorInternships = async () => {
	return authorizedRequest(`${API_BASE}/internships`);
};

export const getSupervisorInterns = async () => {
	return authorizedRequest(`${API_BASE}/interns`);
};

export const getInternAttendance = async (studentInternshipId: number) => {
	return authorizedRequest(`${API_BASE}/intern/${studentInternshipId}/attendance`);
};

export const verifyAttendance = async (attendanceId: number) => {
	return authorizedRequest(`${API_BASE}/attendance/${attendanceId}/verify`, {
		method: "PATCH",
	});
};

export const modifyAttendance = async (
	attendanceId: number,
	payload: {
		time_in?: string;
		time_out?: string;
		working_arrangement?: string;
		task_for_day?: string;
		accomplishments?: string;
		hours_worked?: number;
		modification_notes?: string;
	}
) => {
	return authorizedRequest(`${API_BASE}/attendance/${attendanceId}/modify`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
};

export const submitAppraisalReport = async (studentInternshipId: number, file: File) => {
	const token = localStorage.getItem("authToken");
	const formData = new FormData();
	formData.append("appraisal_report", file);

	const response = await fetch(`${API_BASE}/intern/${studentInternshipId}/appraisal`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: formData,
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.message || "Failed to submit appraisal report");
	}
	return data.data;
};

export const markInternshipAsDone = async (studentInternshipId: number) => {
	return authorizedRequest(`${API_BASE}/intern/${studentInternshipId}/mark-done`, {
		method: "POST",
	});
};

