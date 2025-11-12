const API_BASE = "http://localhost:3000/api/student-internships";

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

export interface StudentInternship {
	student_internship_id: number;
	student_trainee_id: number;
	semestral_internship_listing_id: number;
	supervisor_id: number | null;
	raw_grade: number | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	semestral_internship_listing?: {
		semestral_internship_listing_id: number;
		section_id: number;
		semestral_internship_id: number;
		section?: {
			section_id: number;
			section_name: string;
			program_id: number;
			program?: {
				program_id: number;
				program_name: string;
			};
		};
		semestral_internship?: {
			semestral_internship_id: number;
			academic_year: string;
			semestral: string;
		};
	};
	supervisor?: {
		supervisor_id: number;
		first_name: string;
		last_name: string;
		email: string;
		employer_id: number;
		employer?: {
			employer_id: number;
			company_name: string;
			contact_person: string;
			contact_email: string;
			contact_phone: string;
		};
	} | null;
}

// Get current student's internship
export const getMyStudentInternship = async (): Promise<StudentInternship | null> => {
	const data = await request(`${API_BASE}/my-internship`);
	return data.data || null;
};



