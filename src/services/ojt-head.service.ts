const API_BASE = "http://localhost:3000/api/ojt-head";

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

export interface TopCompany {
	employer_id: number;
	company_name: string;
	student_count: number;
}

export interface OngoingByProgram {
	program_id: number;
	program_name: string;
	student_count: number;
}

export interface OngoingBySemester {
	semestral_internship_id: number;
	academic_year: string;
	semestral: string;
	student_count: number;
}

export interface InternsByProgram {
	program_id: number;
	program_name: string;
	intern_count: number;
}

export interface CompletionByProgram {
	program_id: number;
	program_name: string;
	completed: number;
	pending: number;
	completed_percentage: number;
	pending_percentage: number;
}

export interface InternshipsByIndustry {
	industry_id: number;
	industry_name: string;
	count: number;
}

export interface EvaluationStatus {
	evaluated: number;
	pending: number;
	total: number;
}

export interface MonthlyEngagement {
	month: string;
	monthShort: string;
	count: number;
}

export interface OpportunitiesByProgram {
	program_id: number;
	program_name: string;
	enrolled_students: number;
	internship_opportunities: number;
}

export interface DashboardStats {
	// Key Metrics
	totalInterns: number;
	companiesHostingInterns: number;
	evaluatedInterns: number;
	pendingEvaluations: number;
	// Charts Data
	topCompanies: TopCompany[];
	ongoingByProgram: OngoingByProgram[];
	ongoingBySemester: OngoingBySemester[];
	internsByProgram: InternsByProgram[];
	completionByProgram: CompletionByProgram[];
	internshipsByIndustry: InternshipsByIndustry[];
	evaluationStatus: EvaluationStatus;
	monthlyEngagement: MonthlyEngagement[];
	opportunitiesByProgram: OpportunitiesByProgram[];
}

export interface FilterOptions {
	academicYears: string[];
	semestrals: string[];
}

export const getFilterOptions = async (): Promise<FilterOptions> => {
	const data = await request(`${API_BASE}/dashboard/filter-options`);
	return data.data;
};

export const getDashboardStats = async (academicYear?: string, semestral?: string): Promise<DashboardStats> => {
	// Build query string with filters
	const params = new URLSearchParams();
	if (academicYear && academicYear !== "all") {
		params.append("academic_year", academicYear);
	}
	if (semestral && semestral !== "all") {
		params.append("semestral", semestral);
	}

	const queryString = params.toString();
	const url = queryString ? `${API_BASE}/dashboard/stats?${queryString}` : `${API_BASE}/dashboard/stats`;
	const data = await request(url);
	return data.data;
};

