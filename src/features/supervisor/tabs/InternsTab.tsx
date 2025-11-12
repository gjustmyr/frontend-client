import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getSupervisorInterns } from "../../../services/supervisor.service";

const statusColorMap: Record<string, string> = {
	"pre-ojt": "bg-yellow-100 text-yellow-700",
	ongoing: "bg-blue-100 text-blue-700",
	"post-ojt": "bg-purple-100 text-purple-700",
	completed: "bg-green-100 text-green-700",
	dropped: "bg-red-100 text-red-700",
};

const InternsTab = () => {
	const [loading, setLoading] = useState(true);
	const [interns, setInterns] = useState<any[]>([]);

	const fetchInterns = async () => {
		try {
			setLoading(true);
			const data = await getSupervisorInterns();
			setInterns(data || []);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load assigned interns",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInterns();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading interns...</div>
			</div>
		);
	}

	if (interns.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				You don’t have interns assigned yet.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl poppins-semibold text-gray-800">Assigned Interns</h2>
			<p className="text-gray-600 poppins-regular">
				Track your interns’ progress and reach out if they need support. You can jump to the “Status &amp; OEAMS” tab for detailed logs.
			</p>

			<div className="space-y-3">
				{interns.map((internship) => {
					const trainee = internship.StudentTrainee;
					const fullName = [
						trainee?.prefix_name,
						trainee?.first_name,
						trainee?.middle_name,
						trainee?.last_name,
						trainee?.suffix_name,
					]
						.filter(Boolean)
						.join(" ");
					const status = internship.status || "unknown";
					const statusClass = statusColorMap[status] || "bg-gray-100 text-gray-700";

					return (
						<div
							key={internship.student_internship_id}
							className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
								<div>
									<p className="text-lg poppins-semibold text-gray-800">{fullName}</p>
									<p className="text-sm text-gray-500 poppins-regular">
										Email: {trainee?.User?.email || "N/A"}
									</p>
								</div>
								<span className={`px-3 py-1 rounded-full text-xs poppins-semibold ${statusClass}`}>
									{status.replace(/-/g, " ").toUpperCase()}
								</span>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-600 poppins-regular">
								<div>
									<p className="font-semibold text-gray-700">Internship ID</p>
									<p>{internship.student_internship_id}</p>
								</div>
								<div>
									<p className="font-semibold text-gray-700">Latest Hours</p>
									<p>{internship.ojt_hours ?? 0}</p>
								</div>
								<div>
									<p className="font-semibold text-gray-700">Raw Grade</p>
									<p>{internship.raw_grade ?? "N/A"}</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default InternsTab;

