import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiExternalLink, FiSearch, FiStar } from "react-icons/fi";
import Swal from "sweetalert2";
import {
	getRecommendedInternships,
	type InternshipRecommendation,
} from "../../../services/internship.service";

const RECOMMENDATION_THRESHOLD = 0.2;

const JobRecommendationsTab = () => {
	const [recommendations, setRecommendations] = useState<InternshipRecommendation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedSearch(searchTerm.trim());
		}, 400);
		return () => clearTimeout(handle);
	}, [searchTerm]);

	useEffect(() => {
		let isMounted = true;
		const fetchRecommendations = async () => {
			try {
				setLoading(true);
				const data = await getRecommendedInternships(
					debouncedSearch ? { search: debouncedSearch } : undefined
				);
				if (isMounted) {
					setRecommendations(data);
				}
			} catch (error: any) {
				console.error("Failed to load recommendations", error);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: error.message || "Unable to load job recommendations right now.",
				});
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchRecommendations();
		return () => {
			isMounted = false;
		};
	}, [debouncedSearch]);

	const anyRecommended = useMemo(
		() => recommendations.some((item) => item.is_recommended),
		[recommendations]
	);

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div>
					<h2 className="text-xl poppins-semibold text-gray-800">Recommended Internships</h2>
					<p className="text-gray-600 poppins-regular mt-1 max-w-2xl">
						We analyse your program, department, and declared skills to surface internships that closely match your profile using cosine similarity powered by TensorFlow.
					</p>
				</div>

				<div className="relative w-full md:w-72">
					<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
					<input
						type="text"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search by role or keyword..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent poppins-regular text-sm"
					/>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-12 text-gray-500 poppins-regular">
					Loading personalised matches...
				</div>
			) : recommendations.length === 0 ? (
				<div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
					<FiCheckCircle size={40} className="mx-auto text-gray-400 mb-3" />
					<h3 className="text-lg poppins-semibold text-gray-700 mb-1">No matches yet</h3>
					<p className="text-gray-500 poppins-regular">
						We couldn’t find internships that match your current criteria. Try a different keyword or update your skill profile with your coordinator.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{!anyRecommended && (
						<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 poppins-regular">
							No strong matches yet. Keep your profile updated to receive tailored recommendations.
						</div>
					)}

					{recommendations.map((item) => {
						const scorePercent = Math.max(0, Math.round(item.recommendation_score * 100));
						return (
							<div
								key={item.internship_id}
								className="border border-gray-200 rounded-lg shadow-sm bg-white p-5 flex flex-col gap-4">
								<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<h3 className="text-lg poppins-semibold text-gray-900">
												{item.title}
											</h3>
											{item.is_recommended && (
												<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 poppins-semibold">
													<FiStar size={12} /> Recommended for you
												</span>
											)}
										</div>
										<p className="text-sm text-gray-600 poppins-regular mt-1">
											{item.employer?.company_name || "N/A"}
											{item.employer?.industry?.industry_name && (
												<span className="ml-2 text-gray-400">• {item.employer.industry.industry_name}</span>
											)}
										</p>
									</div>
									<div className="md:text-right">
										<p className="text-sm poppins-medium text-gray-500">Match Score</p>
										<div className="flex items-center gap-2 md:justify-end">
											<div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													style={{ width: `${Math.min(scorePercent, 100)}%` }}
													className={`h-full rounded-full ${
														scorePercent >= RECOMMENDATION_THRESHOLD * 100
															? "bg-green-500"
															: "bg-gray-300"
													}`}
												/>
											</div>
											<span className="text-sm poppins-semibold text-gray-700">{scorePercent}%</span>
										</div>
									</div>
								</div>

								{item.description && (
									<p className="text-sm text-gray-700 poppins-regular leading-relaxed">
										{item.description.length > 280
												? `${item.description.slice(0, 277)}...`
												: item.description}
									</p>
								)}

								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<div className="flex flex-wrap items-center gap-2">
										{item.matched_skills.length > 0 ? (
											<>
												<span className="text-xs uppercase tracking-wide text-gray-500 poppins-medium mr-1">
													Matching Skills:
												</span>
												{item.matched_skills.map((skill) => (
													<span
														key={skill}
														className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full poppins-medium">
														{skill}
													</span>
												))}
											</>
										) : (
											<span className="text-xs text-gray-400 poppins-regular">
												No direct skill overlap detected
											</span>
										)}
									</div>

									{item.skills.length > 0 && (
										<button
											onClick={() => {
												Swal.fire({
													title: item.title,
													text: `Required skills: ${item.skills
														.map((skill) => skill.skill_name)
														.join(", ")}`,
													icon: "info",
													confirmButtonText: "Close",
													customClass: {
														confirmButton: "bg-green-500",
													},
												});
											}}
											className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm poppins-medium text-gray-600 hover:bg-gray-100 transition-colors">
											<FiExternalLink size={14} /> View Required Skills
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default JobRecommendationsTab;
