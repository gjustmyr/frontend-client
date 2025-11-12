const getRole = (name: string) => {
	switch (name) {
		case "alumni":
			return "Alumni";
		case "company-representative":
		case "employer":
			return "Company Representative";
		case "job-placement":
		case "job-placement-head":
			return "Job Placement";
		case "ojt-head":
			return "OJT Head";
		case "ojt-coordinator":
			return "OJT Coordinator";
		case "student-trainee":
			return "Student Trainee";
		case "super-admin":
		case "superadmin":
			return "Super Admin";
		case "training-supervisor":
		case "supervisor":
			return "Training Supervisor";
		default:
			return "Unknown Role";
	}
};

export { getRole };
