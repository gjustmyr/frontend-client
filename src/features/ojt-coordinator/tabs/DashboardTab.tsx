import { useState, useEffect } from "react";
import { getDashboardStats, getFilterOptions, type CoordinatorDashboardStats, type FilterOptions } from "../../../services/ojt-coordinator.service";
import Swal from "sweetalert2";
import {
	FiUsers,
	FiClock,
	FiTrendingUp,
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
import { Pie } from "react-chartjs-2";

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
	"rgba(20, 184, 166, 0.8)", // teal
	"rgba(251, 191, 36, 0.8)", // yellow
	"rgba(168, 85, 247, 0.8)", // violet
	"rgba(249, 115, 22, 0.8)", // orange-red
];

const BORDER_COLORS = [
	"rgba(59, 130, 246, 1)",
	"rgba(16, 185, 129, 1)",
	"rgba(245, 158, 11, 1)",
	"rgba(239, 68, 68, 1)",
	"rgba(139, 92, 246, 1)",
	"rgba(236, 72, 153, 1)",
	"rgba(20, 184, 166, 1)",
	"rgba(251, 191, 36, 1)",
	"rgba(168, 85, 247, 1)",
	"rgba(249, 115, 22, 1)",
];

// Format status for display
const formatStatus = (status: string): string => {
	return status
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

const DashboardTab = () => {
	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState<CoordinatorDashboardStats | null>(null);
	const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

	// Filter states
	const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
	const [selectedSemestral, setSelectedSemestral] = useState<string>("all");

	useEffect(() => {
		fetchFilterOptions();
		fetchDashboardStats();
	}, []);

	useEffect(() => {
		fetchDashboardStats();
	}, [selectedAcademicYear, selectedSemestral]);

	const fetchFilterOptions = async () => {
		try {
			const data = await getFilterOptions();
			setFilterOptions(data);
		} catch (error: any) {
			console.error("Error fetching filter options:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load filter options",
			});
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

	// Prepare pie chart data for status distribution
	const getStatusChartData = () => {
		if (!dashboardData || !dashboardData.statusDistribution) {
			return null;
		}

		const statusDistribution = dashboardData.statusDistribution;
		const labels = Object.keys(statusDistribution).map(formatStatus);
		const values = Object.values(statusDistribution);
		const colors = COLORS.slice(0, labels.length);
		const borderColors = BORDER_COLORS.slice(0, labels.length);

		return {
			labels,
			datasets: [
				{
					label: "Students",
					data: values,
					backgroundColor: colors,
					borderColor: borderColors,
					borderWidth: 2,
				},
			],
		};
	};

	const chartData = getStatusChartData();

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				position: "right" as const,
				labels: {
					padding: 15,
					font: {
						family: "Poppins",
						size: 12,
					},
				},
			},
			title: {
				display: true,
				text: "Student Internship Status Distribution",
                font: { family: "Poppins", size: 14, weight: "bold" }, // ✅ change weight here

				padding: {
					top: 10,
					bottom: 20,
				},
			},
			tooltip: {
				callbacks: {
					label: (context: any) => {
						const label = context.label || "";
						// For pie charts, get the value from the dataset
						const value = context.dataset.data[context.dataIndex] || 0;
						const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
						const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
						return `${label}: ${value} (${percentage}%)`;
					},
				},
			},
		},
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="text-gray-500 poppins-regular">Loading dashboard...</div>
			</div>
		);
	}

	if (!dashboardData) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				<p>No data available</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Filters */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl poppins-semibold text-gray-800">Dashboard</h2>
					<p className="text-gray-600 poppins-regular mt-1">
						Overview of student internships and OJT hours
					</p>
				</div>
				<div className="flex items-center gap-3">
					{/* Academic Year Filter */}
					<div className="flex items-center gap-2">
						<FiFilter className="text-gray-500" size={18} />
						<select
							value={selectedAcademicYear}
							onChange={(e) => setSelectedAcademicYear(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 poppins-regular text-sm">
							<option value="all">All Academic Years</option>
							{filterOptions?.academicYears.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>

					{/* Semester Filter */}
					<select
						value={selectedSemestral}
						onChange={(e) => setSelectedSemestral(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 poppins-regular text-sm">
						<option value="all">All Semesters</option>
						{filterOptions?.semestrals.map((semestral) => (
							<option key={semestral} value={semestral}>
								{semestral}
							</option>
						))}
					</select>

					{/* Refresh Button */}
					<button
						onClick={fetchDashboardStats}
						className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
						title="Refresh Dashboard">
						<FiRefreshCw size={20} />
					</button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Total Students Card */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm poppins-regular text-gray-600">Total Students</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{dashboardData.totalStudents}
							</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<FiUsers className="text-blue-600" size={24} />
						</div>
					</div>
				</div>

				{/* Total Hours Card */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm poppins-regular text-gray-600">Total OJT Hours</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{(dashboardData.totalHours || 0).toLocaleString()}
							</p>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<FiClock className="text-green-600" size={24} />
						</div>
					</div>
				</div>

				{/* Average Hours Card */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm poppins-regular text-gray-600">Average Hours</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{(dashboardData.averageHours || 0).toFixed(1)}
							</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<FiTrendingUp className="text-purple-600" size={24} />
						</div>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Status Distribution Pie Chart */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					{chartData ? (
						<div className="h-[400px]">
							<Pie data={chartData} options={chartOptions as any} />
						</div>
					) : (
						<div className="flex items-center justify-center h-[400px] text-gray-500 poppins-regular">
							No status data available
						</div>
					)}
				</div>

				{/* OJT Hours Tracking Table */}
				<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
					<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
						OJT Hours Accomplished
					</h3>
					{dashboardData.studentsWithHours.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr className="border-b border-gray-200">
										<th className="py-3 px-4 text-sm poppins-semibold text-gray-700">
											Student Name
										</th>
										<th className="py-3 px-4 text-sm poppins-semibold text-gray-700">
											Status
										</th>
										<th className="py-3 px-4 text-sm poppins-semibold text-gray-700 text-right">
											Hours
										</th>
									</tr>
								</thead>
								<tbody>
									{dashboardData.studentsWithHours.slice(0, 10).map((student) => (
										<tr
											key={student.student_internship_id}
											className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4 text-sm poppins-regular text-gray-800">
												{student.student_name}
											</td>
											<td className="py-3 px-4">
												<span
													className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
														student.status === "ongoing"
															? "bg-blue-100 text-blue-700"
															: student.status === "completed"
															? "bg-green-100 text-green-700"
															: student.status === "pre-ojt"
															? "bg-yellow-100 text-yellow-700"
															: student.status === "post-ojt"
															? "bg-purple-100 text-purple-700"
															: student.status === "dropped"
															? "bg-red-100 text-red-700"
															: "bg-gray-100 text-gray-700"
													}`}>
													{formatStatus(student.status)}
												</span>
											</td>
											<td className="py-3 px-4 text-sm poppins-semibold text-gray-800 text-right">
												{student.ojt_hours.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{dashboardData.studentsWithHours.length > 10 && (
								<p className="text-xs poppins-regular text-gray-500 mt-3 text-center">
									Showing top 10 of {dashboardData.studentsWithHours.length} students
								</p>
							)}
						</div>
					) : (
						<div className="text-center py-10 text-gray-500 poppins-regular">
							<p>No students with OJT hours recorded yet</p>
						</div>
					)}
				</div>
			</div>

			{/* All Students by Status Table */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
					All Students by Status
				</h3>
				{dashboardData.studentsByStatus.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="py-3 px-4 text-sm poppins-semibold text-gray-700">
										Student Name
									</th>
									<th className="py-3 px-4 text-sm poppins-semibold text-gray-700">
										Status
									</th>
									<th className="py-3 px-4 text-sm poppins-semibold text-gray-700 text-right">
										OJT Hours
									</th>
								</tr>
							</thead>
							<tbody>
								{dashboardData.studentsByStatus.map((student) => (
									<tr
										key={student.student_internship_id}
										className="border-b border-gray-100 hover:bg-gray-50">
										<td className="py-3 px-4 text-sm poppins-regular text-gray-800">
											{student.student_name}
										</td>
										<td className="py-3 px-4">
											<span
												className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
													student.status === "ongoing"
														? "bg-blue-100 text-blue-700"
														: student.status === "completed"
														? "bg-green-100 text-green-700"
														: student.status === "pre-ojt"
														? "bg-yellow-100 text-yellow-700"
														: student.status === "post-ojt"
														? "bg-purple-100 text-purple-700"
														: student.status === "dropped"
														? "bg-red-100 text-red-700"
														: "bg-gray-100 text-gray-700"
												}`}>
												{formatStatus(student.status)}
											</span>
										</td>
										<td className="py-3 px-4 text-sm poppins-semibold text-gray-800 text-right">
											{student.ojt_hours > 0 ? student.ojt_hours.toLocaleString() : "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="text-center py-10 text-gray-500 poppins-regular">
						<p>No students found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardTab;

