import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
	getJobApprovals,
} from "../../../services/job-placement.service";
import {
	updateApprovalStatus,
} from "../../../services/internship.service";
import { FiEye, FiCheck, FiX } from "react-icons/fi";
import Modal from "../../ojt-heads/modal/Modal";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface JobPosting {
	internship_id: number;
	title: string;
	description: string;
	is_hiring: boolean;
	approval_status: ApprovalStatus;
	createdAt: string;
	Employer?: {
		company_name: string;
		contact_person: string;
		contact_email: string;
		eligibility: string;
	};
	InternshipSkills?: Array<{
		skill_id: number;
		Skill?: {
			skill_name: string;
		};
	}>;
	JobRequirements?: Array<{
		job_requirement_id: number;
		title: string;
		is_required: boolean;
	}>;
}

const statusOptions: Array<{ label: string; value: ApprovalStatus | "all" }> = [
	{ label: "All", value: "all" },
	{ label: "Pending", value: "pending" },
	{ label: "Approved", value: "approved" },
	{ label: "Rejected", value: "rejected" },
];

const JobApprovalsTab = () => {
	const [jobs, setJobs] = useState<JobPosting[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
	const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

	const fetchJobs = async (status?: ApprovalStatus | "all") => {
		try {
			setLoading(true);
			const data = await getJobApprovals(status !== "all" ? status : undefined);
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

	useEffect(() => {
		fetchJobs(filter);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const handleStatusChange = async (job: JobPosting, status: ApprovalStatus) => {
		try {
			await updateApprovalStatus(job.internship_id, status);
			Swal.fire({
				icon: "success",
				title: "Success",
				text: `Job posting marked as ${status}.`,
				timer: 2000,
				showConfirmButton: false,
			});
			fetchJobs(filter);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to update job approval status",
			});
		}
	};

	const filteredJobs = useMemo(() => jobs, [jobs]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl poppins-semibold text-gray-800">Job Approvals</h2>
					<p className="text-gray-600 poppins-regular mt-1">
						Review employer job postings before publishing to alumni.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600 poppins-medium">Filter:</label>
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value as ApprovalStatus | "all")}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 poppins-regular text-sm">
						{statusOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<p className="text-gray-500 poppins-regular">Loading job postings...</p>
					</div>
				) : filteredJobs.length === 0 ? (
					<div className="text-center py-10 text-gray-500 poppins-regular">
						No job postings found for this filter.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border-collapse text-sm">
							<thead className="bg-green-500 text-white poppins-semibold">
								<tr>
									<th className="px-4 py-3 text-left">Job Title</th>
									<th className="px-4 py-3 text-left">Employer</th>
									<th className="px-4 py-3 text-left">Posted</th>
									<th className="px-4 py-3 text-center">Status</th>
									<th className="px-4 py-3 text-center">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 poppins-regular text-gray-800">
								{filteredJobs.map((job) => (
									<tr key={job.internship_id} className="hover:bg-gray-50 transition-colors">
										<td className="px-4 py-3">
											<p className="font-semibold">{job.title}</p>
											{job.InternshipSkills?.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-1">
													{job.InternshipSkills.map((skillWrapper) => (
														<span
															key={skillWrapper.skill_id}
															className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
															{skillWrapper.Skill?.skill_name}
														</span>
													))}
												</div>
											)}
										</td>
										<td className="px-4 py-3">
											<p>{job.Employer?.company_name || "N/A"}</p>
											<p className="text-xs text-gray-500">
												{job.Employer?.contact_email || "No contact email"}
											</p>
										</td>
										<td className="px-4 py-3">
											{new Date(job.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-center">
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
										</td>
										<td className="px-4 py-3 text-center space-x-2">
											<button
												className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
												onClick={() => setSelectedJob(job)}
												title="View Details">
												<FiEye />
											</button>
											<button
												className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
												onClick={() => handleStatusChange(job, "approved")}
												disabled={job.approval_status === "approved"}
												title="Approve">
												<FiCheck />
											</button>
											<button
												className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
												onClick={() => handleStatusChange(job, "rejected")}
												disabled={job.approval_status === "rejected"}
												title="Reject">
												<FiX />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{selectedJob && (
				<Modal onClose={() => setSelectedJob(null)} size="lg">
					<h3 className="text-xl poppins-semibold text-gray-800 mb-4">
						{selectedJob.title}
					</h3>

					<div className="space-y-3 poppins-regular text-sm text-gray-700">
						<div>
							<p className="font-semibold text-gray-800">Employer</p>
							<p>{selectedJob.Employer?.company_name || "N/A"}</p>
							<p className="text-xs text-gray-500">
								Contact: {selectedJob.Employer?.contact_email || "N/A"}
							</p>
						</div>

						<div>
							<p className="font-semibold text-gray-800 mb-1">Description</p>
							<div
								className="bg-gray-50 border border-gray-200 rounded-lg p-3 prose prose-sm max-w-none"
								dangerouslySetInnerHTML={{ __html: selectedJob.description || "" }}
							/>
						</div>

						{selectedJob.JobRequirements && selectedJob.JobRequirements.length > 0 && (
							<div>
								<p className="font-semibold text-gray-800 mb-2">Requirements</p>
								<ul className="list-disc pl-5 space-y-1">
									{selectedJob.JobRequirements.map((req) => (
										<li key={req.job_requirement_id}>
											<span className="font-medium">{req.title}</span>{" "}
											{req.is_required ? "(Required)" : "(Optional)"}
										</li>
									))}
								</ul>
							</div>
						)}

						<p className="text-xs text-gray-400">
							Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
						</p>
					</div>

					<div className="flex justify-end gap-2 mt-6">
						<button
							className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 poppins-medium"
							onClick={() => setSelectedJob(null)}>
							Close
						</button>
						<button
							className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium"
							onClick={() => {
								handleStatusChange(selectedJob, "approved");
								setSelectedJob(null);
							}}>
							Approve
						</button>
						<button
							className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 poppins-medium"
							onClick={() => {
								handleStatusChange(selectedJob, "rejected");
								setSelectedJob(null);
							}}>
							Reject
						</button>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default JobApprovalsTab;

