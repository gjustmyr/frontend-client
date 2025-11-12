import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getSupervisorInternships } from "../../../services/supervisor.service";

const InternshipListingTab = () => {
	const [loading, setLoading] = useState(true);
	const [internships, setInternships] = useState<any[]>([]);

	const fetchInternships = async () => {
		try {
			setLoading(true);
			const data = await getSupervisorInternships();
			setInternships(data || []);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load internship listings",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInternships();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading internship listings...</div>
			</div>
		);
	}

	if (internships.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				No active internship postings for your employer right now.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl poppins-semibold text-gray-800">Internship Listings</h2>
			<p className="text-gray-600 poppins-regular mb-4">
				These are the opportunities posted by your employer. You can use these to match interns and monitor their progress.
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{internships.map((internship) => (
					<div
						key={internship.internship_id}
						className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
						<div className="flex items-center justify-between">
							<h3 className="text-lg poppins-semibold text-gray-900">{internship.title}</h3>
							<span
								className={`px-3 py-1 rounded-full text-xs poppins-semibold ${
									internship.approval_status === "approved"
										? "bg-green-100 text-green-700"
										: internship.approval_status === "pending"
										? "bg-yellow-100 text-yellow-700"
										: "bg-red-100 text-red-700"
								}`}>
								{internship.approval_status.toUpperCase()}
							</span>
						</div>

						<p className="text-sm text-gray-600 poppins-regular leading-relaxed">
							{internship.description?.replace(/<[^>]+>/g, "").slice(0, 280) || "No description provided."}
							{internship.description?.length > 280 && "..."}
						</p>

						<div className="flex flex-wrap gap-2">
							{internship.InternshipSkills?.length > 0 ? (
								internship.InternshipSkills.map((skillWrapper: any) => (
									<span
										key={skillWrapper.skill_id}
										className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full poppins-medium">
										{skillWrapper.Skill?.skill_name}
									</span>
								))
							) : (
								<span className="text-xs text-gray-400">No skills tagged</span>
							)}
						</div>

						<p className="text-xs text-gray-400">
							Posted on {new Date(internship.createdAt).toLocaleDateString()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default InternshipListingTab;

