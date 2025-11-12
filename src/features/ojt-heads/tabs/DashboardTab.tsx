import { useState, useEffect } from "react";
import { getDashboardStats, getFilterOptions } from "../../../services/ojt-head.service";
import type { DashboardStats } from "../../../services/ojt-head.service";
import { getIndustries, getPrograms, getLocations } from "../../../services/dropdown.service";
import { getEmployers } from "../../../services/employee.service";
import Swal from "sweetalert2";
import {
	FiUsers,
	FiBriefcase,
	FiCheckCircle,
	FiAlertTriangle,
	FiFilter,
	FiRefreshCw,
} from "react-icons/fi";

// Chart.js imports
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

const COLORS = [
	"rgba(59, 130, 246, 0.8)", // blue
	"rgba(16, 185, 129, 0.8)", // green
	"rgba(245, 158, 11, 0.8)", // orange
	"rgba(239, 68, 68, 0.8)", // red
	"rgba(139, 92, 246, 0.8)", // purple
	"rgba(236, 72, 153, 0.8)", // pink
];

const BORDER_COLORS = [
	"rgba(59, 130, 246, 1)",
	"rgba(16, 185, 129, 1)",
	"rgba(245, 158, 11, 1)",
	"rgba(239, 68, 68, 1)",
	"rgba(139, 92, 246, 1)",
	"rgba(236, 72, 153, 1)",
];

const DashboardTab = () => {
	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);

	// Filter states
	const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
	const [selectedCompany, setSelectedCompany] = useState<string>("all");
	const [selectedLocation, setSelectedLocation] = useState<string>("all");
	const [selectedProgram, setSelectedProgram] = useState<string>("all");
	const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
	const [selectedSemestral, setSelectedSemestral] = useState<string>("all");

	// Filter options
	const [industries, setIndustries] = useState<any[]>([]);
	const [companies, setCompanies] = useState<any[]>([]);
	const [locations, setLocations] = useState<any[]>([]);
	const [programs, setPrograms] = useState<any[]>([]);
	const [academicYears, setAcademicYears] = useState<string[]>([]);
	const [semestrals, setSemestrals] = useState<string[]>([]);

	useEffect(() => {
		fetchFilterOptions();
		fetchDashboardStats();
	}, [selectedAcademicYear, selectedSemestral]);

	const fetchFilterOptions = async () => {
		try {
			const [industriesData, companiesData, locationsData, programsData, filterOptionsData] = await Promise.all([
				getIndustries(),
				getEmployers(),
				getLocations(),
				getPrograms(),
				getFilterOptions(),
			]);
			setIndustries(industriesData || []);
			setCompanies(companiesData || []);
			setLocations(locationsData || []);
			setPrograms(programsData || []);
			setAcademicYears(filterOptionsData?.academicYears || []);
			setSemestrals(filterOptionsData?.semestrals || []);
		} catch (error: any) {
			console.error("Error fetching filter options:", error);
		}
	};

	const fetchDashboardStats = async () => {
		setLoading(true);
		try {
			const data = await getDashboardStats(
				selectedAcademicYear !== "all" ? selectedAcademicYear : undefined,
				selectedSemestral !== "all" ? selectedSemestral : undefined
			);
			setDashboardData(data);
		} catch (error: any) {
			console.error("Error fetching dashboard stats:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load dashboard statistics",
			});
		} finally {
			setLoading(false);
		}
	};

	// Apply filters to data
	const getFilteredData = () => {
		if (!dashboardData) return null;

		// For now, filters are not applied on backend, so we return all data
		// In the future, you can filter client-side or pass filters to backend
		return dashboardData;
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="text-gray-500 poppins-regular">Loading dashboard statistics...</div>
			</div>
		);
	}

	const filteredData = getFilteredData();

	if (!filteredData) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				No data available
			</div>
		);
	}

	// Chart data preparations
	const internsByProgramData = {
		labels: filteredData.internsByProgram?.slice(0, 10).map((p) => p.program_name) || [],
		datasets: [
			{
				label: "Interns",
				data: filteredData.internsByProgram?.slice(0, 10).map((p) => p.intern_count) || [],
				backgroundColor: COLORS[0],
				borderColor: BORDER_COLORS[0],
				borderWidth: 1,
			},
		],
	};

	const completionByProgramData = {
		labels: filteredData.completionByProgram?.slice(0, 10).map((p) => p.program_name) || [],
		datasets: [
			{
				label: "Completed",
				data: filteredData.completionByProgram?.slice(0, 10).map((p) => p.completed) || [],
				backgroundColor: COLORS[1],
				borderColor: BORDER_COLORS[1],
				borderWidth: 1,
			},
			{
				label: "Pending",
				data: filteredData.completionByProgram?.slice(0, 10).map((p) => p.pending) || [],
				backgroundColor: COLORS[2],
				borderColor: BORDER_COLORS[2],
				borderWidth: 1,
			},
		],
	};

	const internshipsByIndustryData = {
		labels: filteredData.internshipsByIndustry?.map((i) => i.industry_name) || [],
		datasets: [
			{
				label: "Internship Listings",
				data: filteredData.internshipsByIndustry?.map((i) => i.count) || [],
				backgroundColor: COLORS,
				borderColor: BORDER_COLORS,
				borderWidth: 1,
			},
		],
	};

	const evaluationStatusData = {
		labels: ["Evaluated", "Pending"],
		datasets: [
			{
				label: "Evaluation Status",
				data: [
					filteredData.evaluationStatus?.evaluated || 0,
					filteredData.evaluationStatus?.pending || 0,
				],
				backgroundColor: [COLORS[1], COLORS[2]],
				borderColor: [BORDER_COLORS[1], BORDER_COLORS[2]],
				borderWidth: 1,
			},
		],
	};

	const opportunitiesByProgramData = {
		labels: filteredData.opportunitiesByProgram?.slice(0, 10).map((p) => p.program_name) || [],
		datasets: [
			{
				label: "Enrolled Students",
				data:
					filteredData.opportunitiesByProgram?.slice(0, 10).map((p) => p.enrolled_students) || [],
				backgroundColor: COLORS[0],
				borderColor: BORDER_COLORS[0],
				borderWidth: 1,
			},
			{
				label: "Internship Opportunities",
				data:
					filteredData.opportunitiesByProgram?.slice(0, 10).map((p) => p.internship_opportunities) ||
					[],
				backgroundColor: COLORS[1],
				borderColor: BORDER_COLORS[1],
				borderWidth: 1,
			},
		],
	};

	const topCompaniesData = {
		labels: filteredData.topCompanies?.slice(0, 10).map((c) => c.company_name) || [],
		datasets: [
			{
				label: "Number of Interns",
				data: filteredData.topCompanies?.slice(0, 10).map((c) => c.student_count) || [],
				backgroundColor: COLORS[4],
				borderColor: BORDER_COLORS[4],
				borderWidth: 1,
			},
		],
	};

	const monthlyEngagementData = {
		labels: filteredData.monthlyEngagement?.map((m) => m.monthShort) || [],
		datasets: [
			{
				label: "Internship Activities",
				data: filteredData.monthlyEngagement?.map((m) => m.count) || [],
				borderColor: COLORS[0],
				backgroundColor: COLORS[0].replace("0.8", "0.1"),
				borderWidth: 2,
				fill: true,
				tension: 0.4,
			},
		],
	};

	const ongoingBySemesterData = {
		labels:
			filteredData.ongoingBySemester?.map(
				(s) => `${s.academic_year} - ${s.semestral}`
			) || [],
		datasets: [
			{
				label: "Ongoing Interns",
				data: filteredData.ongoingBySemester?.map((s) => s.student_count) || [],
				backgroundColor: COLORS[5],
				borderColor: BORDER_COLORS[5],
				borderWidth: 1,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: false,
			},
		},
	};

	const barChartOptions = {
		...chartOptions,
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	const pieChartOptions = {
		...chartOptions,
		plugins: {
			...chartOptions.plugins,
			legend: {
				position: "right" as const,
			},
		},
	};

	return (
		<div className="space-y-6">
			{/* Header with Refresh Button */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl poppins-semibold text-gray-800">Dashboard Overview</h2>
				<button
					onClick={fetchDashboardStats}
					className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors poppins-medium">
					<FiRefreshCw size={18} />
					Refresh
				</button>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-md p-4">
				<div className="flex items-center gap-3 mb-3">
					<FiFilter className="text-gray-600" size={20} />
					<h3 className="text-lg poppins-semibold text-gray-800">Filters</h3>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Academic Year
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedAcademicYear}
							onChange={(e) => setSelectedAcademicYear(e.target.value)}>
							<option value="all">All Academic Years</option>
							{academicYears.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Semester
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedSemestral}
							onChange={(e) => setSelectedSemestral(e.target.value)}>
							<option value="all">All Semesters</option>
							{semestrals.map((semestral) => (
								<option key={semestral} value={semestral}>
									{semestral}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Industry
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedIndustry}
							onChange={(e) => setSelectedIndustry(e.target.value)}>
							<option value="all">All Industries</option>
							{industries.map((industry) => (
								<option key={industry.industry_id} value={industry.industry_id}>
									{industry.industry_name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Company
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedCompany}
							onChange={(e) => setSelectedCompany(e.target.value)}>
							<option value="all">All Companies</option>
							{companies.map((company) => (
								<option key={company.employer_id} value={company.employer_id}>
									{company.company_name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Location
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedLocation}
							onChange={(e) => setSelectedLocation(e.target.value)}>
							<option value="all">All Locations</option>
							{locations.map((loc, index) => (
								<option key={index} value={loc.location}>
									{loc.location}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-1">
							Program
						</label>
						<select
							className="w-full p-2 border rounded text-sm poppins-regular"
							value={selectedProgram}
							onChange={(e) => setSelectedProgram(e.target.value)}>
							<option value="all">All Programs</option>
							{programs.map((program) => (
								<option key={program.program_id} value={program.program_id}>
									{program.program_name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Key Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 poppins-regular mb-1">Total Interns</p>
							<p className="text-3xl font-bold text-gray-800 poppins-semibold">
								{filteredData.totalInterns || 0}
							</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<FiUsers className="text-blue-600" size={24} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 poppins-regular mb-1">
								Companies Hosting Interns
							</p>
							<p className="text-3xl font-bold text-gray-800 poppins-semibold">
								{filteredData.companiesHostingInterns || 0}
							</p>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<FiBriefcase className="text-green-600" size={24} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 poppins-regular mb-1">Evaluated Interns</p>
							<p className="text-3xl font-bold text-gray-800 poppins-semibold">
								{filteredData.evaluatedInterns || 0}
							</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<FiCheckCircle className="text-purple-600" size={24} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 poppins-regular mb-1">Pending Evaluations</p>
							<p className="text-3xl font-bold text-gray-800 poppins-semibold">
								{filteredData.pendingEvaluations || 0}
							</p>
						</div>
						<div className="p-3 bg-orange-100 rounded-full">
							<FiAlertTriangle className="text-orange-600" size={24} />
						</div>
					</div>
				</div>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Interns by Program (Bar Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Interns by Program</h3>
					{filteredData.internsByProgram && filteredData.internsByProgram.length > 0 ? (
						<div className="h-[300px]">
							<Bar data={internsByProgramData} options={barChartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* OJT Completion by Program (Stacked Bar Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						OJT Completion by Program (%)
					</h3>
					{filteredData.completionByProgram && filteredData.completionByProgram.length > 0 ? (
						<div className="h-[300px]">
							<Bar
								data={completionByProgramData}
								options={{
									...barChartOptions,
									scales: {
										...barChartOptions.scales,
										x: {
											stacked: true,
										},
										y: {
											stacked: true,
											beginAtZero: true,
										},
									},
								}}
							/>
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Internship Listings by Industry (Pie Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						Internship Listings by Industry
					</h3>
					{filteredData.internshipsByIndustry && filteredData.internshipsByIndustry.length > 0 ? (
						<div className="h-[300px]">
							<Pie data={internshipsByIndustryData} options={pieChartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Evaluation Status (Donut Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Evaluation Status</h3>
					{filteredData.evaluationStatus && filteredData.evaluationStatus.total > 0 ? (
						<div className="h-[300px]">
							<Doughnut data={evaluationStatusData} options={pieChartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Internship Opportunities vs Student Count by Program (Stacked Bar Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						Internship Opportunities vs Student Count by Program
					</h3>
					{filteredData.opportunitiesByProgram && filteredData.opportunitiesByProgram.length > 0 ? (
						<div className="h-[300px]">
							<Bar
								data={opportunitiesByProgramData}
								options={{
									...barChartOptions,
									scales: {
										...barChartOptions.scales,
										x: {
											stacked: true,
										},
										y: {
											stacked: true,
											beginAtZero: true,
										},
									},
								}}
							/>
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Top Companies with Most Interns (Bar Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						Top Companies with Most Interns
					</h3>
					{filteredData.topCompanies && filteredData.topCompanies.length > 0 ? (
						<div className="h-[300px]">
							<Bar data={topCompaniesData} options={barChartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Monthly OJT Engagement (Line Chart) */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Monthly OJT Engagement</h3>
					{filteredData.monthlyEngagement && filteredData.monthlyEngagement.length > 0 ? (
						<div className="h-[300px]">
							<Line data={monthlyEngagementData} options={chartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>

				{/* Ongoing Internships by Semester */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						Ongoing Internships by Semester
					</h3>
					{filteredData.ongoingBySemester && filteredData.ongoingBySemester.length > 0 ? (
						<div className="h-[300px]">
							<Bar data={ongoingBySemesterData} options={barChartOptions} />
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							No data available
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DashboardTab;
