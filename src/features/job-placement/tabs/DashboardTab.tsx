import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDashboardStats } from "../../../services/job-placement.service";
import { FiBriefcase, FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdPendingActions, MdOutlinePlaylistRemove } from "react-icons/md";

interface JobPlacementStats {
	totalJobs: number;
	approvedJobs: number;
	pendingJobs: number;
	rejectedJobs: number;
	totalAlumni: number;
	inactiveAlumni: number;
	jobApplicationsByStatus: Array<{ status: string; count: number }>;
	recentJobs: any[];
}

const statusLabelMap: Record<string, string> = {
	applied: "Applied",
	under_review: "Under Review",
	requirements_pending: "Requirements Pending",
	interview: "Interview",
	hired: "Hired",
	rejected: "Rejected",
};

const DashboardTab = () => {
	const [stats, setStats] = useState<JobPlacementStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				const data = await getDashboardStats();
				setStats(data);
			} catch (error: any) {
				console.error(error);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: error.message || "Failed to load dashboard statistics",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const applicationSummary = useMemo(() => {
		if (!stats) return [];
		return stats.jobApplicationsByStatus.map((item) => ({
			status: statusLabelMap[item.status] || item.status,
			count: Number(item.count) || 0,
		}));
	}, [stats]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="text-gray-500 poppins-regular">Loading dashboard...</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				No dashboard data available.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Total Jobs</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">{stats.totalJobs}</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-full">
							<FiBriefcase className="text-blue-600" size={22} />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Approved Jobs</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{stats.approvedJobs}
							</p>
						</div>
						<div className="p-3 bg-green-100 rounded-full">
							<FiCheckCircle className="text-green-600" size={22} />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Pending Jobs</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{stats.pendingJobs}
							</p>
						</div>
						<div className="p-3 bg-yellow-100 rounded-full">
							<MdPendingActions className="text-yellow-600" size={22} />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Rejected Jobs</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{stats.rejectedJobs}
							</p>
						</div>
						<div className="p-3 bg-red-100 rounded-full">
							<MdOutlinePlaylistRemove className="text-red-600" size={22} />
						</div>
					</div>
				</div>
			</div>

			{/* Alumni summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Total Alumni</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{stats.totalAlumni}
							</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-full">
							<FiUsers className="text-purple-600" size={22} />
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 poppins-regular">Pending Validation</p>
							<p className="text-3xl poppins-bold text-gray-800 mt-2">
								{stats.inactiveAlumni}
							</p>
						</div>
						<div className="p-3 bg-orange-100 rounded-full">
							<FiClock className="text-orange-600" size={22} />
						</div>
					</div>
				</div>
			</div>

			{/* Applications summary */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
					Job Applications by Status
				</h3>
				{applicationSummary.length === 0 ? (
					<p className="text-sm text-gray-500 poppins-regular">
						No job applications recorded yet.
					</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{applicationSummary.map((item) => (
							<div
								key={item.status}
								className="border border-gray-200 rounded-lg p-4 bg-gray-50">
								<p className="text-sm text-gray-500 poppins-medium">{item.status}</p>
								<p className="text-2xl poppins-bold text-gray-800 mt-2">{item.count}</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Recent jobs */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Recent Job Postings</h3>
				{stats.recentJobs.length === 0 ? (
					<p className="text-sm text-gray-500 poppins-regular">No job postings found.</p>
				) : (
					<div className="space-y-4">
						{stats.recentJobs.map((job) => (
							<div
								key={job.internship_id}
								className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
								<div className="flex justify-between items-start">
									<div>
										<h4 className="text-md poppins-semibold text-gray-900">
											{job.title}
										</h4>
										<p className="text-sm text-gray-500 poppins-regular">
											{job.Employer?.company_name || "Unknown company"}
										</p>
									</div>
									<span
										className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
											job.approval_status === "approved"
												? "bg-green-100 text-green-700"
												: job.approval_status === "pending"
												? "bg-yellow-100 text-yellow-700"
												: "bg-red-100 text-red-700"
										}`}>
										{job.approval_status.charAt(0).toUpperCase() +
											job.approval_status.slice(1)}
									</span>
								</div>
								{job.InternshipSkills?.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-3">
										{job.InternshipSkills.map((skillWrapper: any) => (
											<span
												key={skillWrapper.skill_id}
												className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full poppins-medium">
												{skillWrapper.Skill?.skill_name}
											</span>
										))}
									</div>
								)}
								<p className="text-xs text-gray-400 mt-3">
									Posted on {new Date(job.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardTab;

