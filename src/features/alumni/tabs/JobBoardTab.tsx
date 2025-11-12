import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
	getRecommendedInternships,
	type InternshipRecommendation,
} from "../../../services/internship.service";
import {
	applyToJob,
	getMyJobApplications,
} from "../../../services/job-application.service";
import { FiSearch, FiSend } from "react-icons/fi";

const JobBoardTab = () => {
	const [jobs, setJobs] = useState<InternshipRecommendation[]>([]);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search.trim());
		}, 400);
		return () => clearTimeout(handler);
	}, [search]);

	const fetchJobs = async (keyword?: string) => {
		try {
			setLoading(true);
			const data = await getRecommendedInternships(keyword ? { search: keyword } : undefined);
			setJobs(data);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load job listings",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchApplications = async () => {
		try {
			const data = await getMyJobApplications();
			const jobIds = new Set<number>(
				data.map((item: any) => item.internship_id || item.Internship?.internship_id)
			);
			setAppliedJobIds(jobIds);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchJobs(debouncedSearch);
		fetchApplications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch]);

	const handleApply = async (job: InternshipRecommendation) => {
		try {
			await applyToJob({
				internship_id: job.internship_id,
				cover_letter: "",
			});
			Swal.fire({
				icon: "success",
				title: "Application Submitted",
				text: "Your application has been sent to the employer.",
				timer: 2500,
				showConfirmButton: false,
			});
			fetchApplications();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Application Failed",
				text: error.message || "Unable to submit application.",
			});
		}
	};

	const visibleJobs = useMemo(() => jobs, [jobs]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl poppins-semibold text-gray-800">Job Opportunities</h2>
					<p className="text-gray-600 poppins-regular mt-1">
						Explore openings from partnered employers and apply directly.
					</p>
				</div>
				<div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
					<FiSearch className="text-gray-400" />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search job titles or keywords"
						className="outline-none poppins-regular text-sm w-64"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{loading ? (
					<div className="col-span-2 flex justify-center items-center py-10">
						<div className="text-gray-500 poppins-regular">Loading job listings...</div>
					</div>
				) : visibleJobs.length === 0 ? (
					<div className="col-span-2 text-center py-10 text-gray-500 poppins-regular">
						No job postings matched your criteria. Try adjusting your search.
					</div>
				) : (
					visibleJobs.map((job) => {
						const isApplied = appliedJobIds.has(job.internship_id);
						return (
							<div
								key={job.internship_id}
								className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col gap-3">
								<div className="flex flex-col gap-1">
									<h3 className="text-lg poppins-semibold text-gray-900">{job.title}</h3>
									<p className="text-sm text-gray-600 poppins-regular">
										{job.employer?.company_name || "Unknown company"}
										{job.employer?.industry?.industry_name && (
											<span className="ml-2 text-gray-400">
												• {job.employer.industry.industry_name}
											</span>
										)}
									</p>
								</div>

								{job.description && (
									<p className="text-sm text-gray-700 poppins-regular leading-relaxed">
										{job.description.length > 220
											? `${job.description.slice(0, 220)}…`
											: job.description}
									</p>
								)}

								{job.skills.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{job.skills.map((skill) => (
											<span
												key={skill.skill_id}
												className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full poppins-medium">
												{skill.skill_name}
											</span>
										))}
									</div>
								)}

								<div className="flex items-center justify-between mt-auto">
									<div className="text-xs text-gray-400 poppins-regular">
										Last updated {new Date(job.updatedAt).toLocaleDateString()}
									</div>
									<button
										onClick={() => handleApply(job)}
										disabled={isApplied}
										className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md poppins-medium hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
										<FiSend />
										{isApplied ? "Application Sent" : "Apply Now"}
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default JobBoardTab;

