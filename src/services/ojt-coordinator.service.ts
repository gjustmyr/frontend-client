const API_BASE = "http://ec2-47-128-242-59.ap-southeast-1.compute.amazonaws.com:3000/api/ojt-coordinators";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	try {
		const res = await fetch(url, { headers, ...options });
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			throw new Error(data.message || "API request failed");
		}

		return data;
	} catch (err: any) {
		throw new Error(err.message || "Network error");
	}
};

export interface StatusDistribution {
	[key: string]: number;
}

export interface StudentWithHours {
	student_internship_id: number;
	student_name: string;
	status: string;
	ojt_hours: number;
}

export interface StudentByStatus {
	student_internship_id: number;
	student_name: string;
	status: string;
	ojt_hours: number;
}

export interface CoordinatorDashboardStats {
	statusDistribution: StatusDistribution;
	totalStudents: number;
	totalHours: number;
	averageHours: number;
	studentsByStatus: StudentByStatus[];
	studentsWithHours: StudentWithHours[];
}

export interface FilterOptions {
	academicYears: string[];
	semestrals: string[];
}

// Get dashboard statistics for OJT Coordinator
export const getDashboardStats = async (
	academicYear?: string,
	semestral?: string
): Promise<CoordinatorDashboardStats> => {
	// Build query string with filters
	const params = new URLSearchParams();
	if (academicYear && academicYear !== "all") {
		params.append("academic_year", academicYear);
	}
	if (semestral && semestral !== "all") {
		params.append("semestral", semestral);
	}

	const queryString = params.toString();
	const url = queryString
		? `${API_BASE}/dashboard/stats?${queryString}`
		: `${API_BASE}/dashboard/stats`;
	const data = await request(url);
	return data.data;
};

// Get filter options for dashboard
export const getFilterOptions = async (): Promise<FilterOptions> => {
	const data = await request(`${API_BASE}/dashboard/filter-options`);
	return data.data;
};

// Get all OJT Coordinators
export const getOJTCoordinators = async (): Promise<any[]> => {
	const data = await request(`${API_BASE}`);
	return data.data || [];
};

// Create a new OJT Coordinator
export const createOJTCoordinator = async (coordinatorData: {
	first_name: string;
	middle_name?: string;
	last_name: string;
	email: string;
	department_id: string;
}): Promise<any> => {
	const data = await request(`${API_BASE}`, {
		method: "POST",
		body: JSON.stringify(coordinatorData),
	});
	return data;
};

// Update an OJT Coordinator
export const updateOJTCoordinator = async (
	coordinatorId: number,
	coordinatorData: {
		first_name?: string;
		middle_name?: string;
		last_name?: string;
		department_id?: string;
	}
): Promise<any> => {
	const data = await request(`${API_BASE}/${coordinatorId}`, {
		method: "PUT",
		body: JSON.stringify(coordinatorData),
	});
	return data;
};

// Toggle OJT Coordinator status
export const toggleOJTCoordinatorStatus = async (
	coordinatorId: number
): Promise<any> => {
	const data = await request(`${API_BASE}/${coordinatorId}/status`, {
		method: "PATCH",
	});
	return data;
};

// Get students by section for current coordinator
export const getStudentsBySection = async (): Promise<any[]> => {
	const data = await request(`${API_BASE}/students-by-section`);
	return data.data || [];
};

// Add students to a section
export const addStudentsToSection = async (sectionData: {
	section_id: number;
	academic_year: string;
	semestral: string;
	students: Array<{
		first_name: string;
		middle_name?: string;
		last_name: string;
		prefix_name?: string;
		suffix_name?: string;
		email: string;
		sex: string;
		civil_status: string;
	}>;
}): Promise<any> => {
	const data = await request(`${API_BASE}/add-students-to-section`, {
		method: "POST",
		body: JSON.stringify(sectionData),
	});
	return data;
};

// Add students from Excel file
export const addStudentsFromExcel = async (excelData: {
	section_id: number;
	academic_year: string;
	semestral: string;
	excel_file: File;
}): Promise<any> => {
	const formData = new FormData();
	formData.append("excel_file", excelData.excel_file);
	formData.append("section_id", excelData.section_id.toString());
	formData.append("academic_year", excelData.academic_year);
	formData.append("semestral", excelData.semestral);

	const data = await request(`${API_BASE}/add-students-from-excel`, {
		method: "POST",
		body: formData,
	});
	return data;
};
