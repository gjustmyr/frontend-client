import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
	getMyJobApplications,
} from "../../../services/job-application.service";
import {
	submitJobRequirement,
} from "../../../services/job-requirement.service";
import { FiUploadCloud } from "react-icons/fi";

interface JobRequirement {
	job_requirement_id: number;
	title: string;
	is_required: boolean;
	AlumniRequirementSubmissions?: Array<{
		alumni_requirement_submission_id: number;
		status: "submitted" | "approved" | "rejected";
		document_url: string;
		remarks?: string;
	}>;
}

interface JobApplication {
	job_application_id: number;
	status: string;
	createdAt: string;
	Internship?: {
		internship_id: number;
		title: string;
		description: string;
		Employer?: {
			company_name: string;
			contact_email?: string;
		};
		JobRequirements?: JobRequirement[];
	};
}

const statusColors: Record<string, string> = {
	applied: "bg-blue-100 text-blue-700",
	under_review: "bg-yellow-100 text-yellow-700",
	requirements_pending: "bg-orange-100 text-orange-700",
	interview: "bg-purple-100 text-purple-700",
	hired: "bg-green-100 text-green-700",
	rejected: "bg-red-100 text-red-700",
};

const ApplicationsTab = () => {
	const [applications, setApplications] = useState<JobApplication[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchApplications = async () => {
		try {
			setLoading(true);
			const data = await getMyJobApplications();
			setApplications(data);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load job applications",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApplications();
	}, []);

	const handleRequirementUpload = async (
		jobRequirementId: number,
		jobApplicationId: number,
		file: File
	) => {
		try {
			const formData = new FormData();
			formData.append("document", file);
			formData.append("job_application_id", jobApplicationId.toString());
			await submitJobRequirement(jobRequirementId, formData);
			Swal.fire({
				icon: "success",
				title: "Uploaded",
				text: "Requirement submitted successfully.",
				timer: 2000,
				showConfirmButton: false,
			});
			fetchApplications();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Upload Failed",
				text: error.message || "Unable to submit requirement.",
			});
		}
	};

	const renderRequirement = (req: JobRequirement, application: JobApplication) => {
		const submission = req.AlumniRequirementSubmissions?.[0];
		const statusLabel = submission
			? submission.status === "submitted"
				? "Under Review"
				: submission.status === "approved"
				? "Approved"
				: "Needs Revision"
			: req.is_required
			? "Pending"
			: "Optional";

		const statusColor =
			submission?.status === "approved"
				? "bg-green-100 text-green-700"
				: submission?.status === "rejected"
				? "bg-red-100 text-red-700"
				: submission
				? "bg-yellow-100 text-yellow-700"
				: req.is_required
				? "bg-orange-100 text-orange-700"
				: "bg-gray-100 text-gray-600";

		return (
			<div
				key={req.job_requirement_id}
				className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<div>
						<p className="poppins-medium text-gray-800">{req.title}</p>
						<p className="text-xs text-gray-500 poppins-regular">
							{req.is_required ? "Required" : "Optional"}
						</p>
					</div>
					<span className={`px-3 py-1 rounded-full text-xs poppins-semibold ${statusColor}`}>
						{statusLabel}
					</span>
				</div>
				{submission?.document_url && (
					<a
						href={submission.document_url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
						View submitted file
					</a>
				)}
				{submission?.remarks && (
					<p className="text-xs text-red-500 poppins-regular">Remarks: {submission.remarks}</p>
				)}
				{(!submission || submission.status === "rejected") && (
					<label className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 cursor-pointer">
						<FiUploadCloud />
						Upload PDF
						<input
							type="file"
							accept="application/pdf"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									handleRequirementUpload(
										req.job_requirement_id,
										application.job_application_id,
										file
									);
								}
								e.target.value = "";
							}}
						/>
					</label>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-2xl poppins-semibold text-gray-800">My Applications</h2>
				<p className="text-gray-600 poppins-regular mt-1">
					Track the status of your job applications and submit requested requirements.
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center items-center py-10">
					<p className="text-gray-500 poppins-regular">Loading applications...</p>
				</div>
			) : applications.length === 0 ? (
				<div className="text-center py-10 text-gray-500 poppins-regular">
					You have not submitted any applications yet.
				</div>
			) : (
				<div className="space-y-4">
					{applications.map((application) => {
						const job = application.Internship;
						if (!job) return null;
						const statusClass = statusColors[application.status] || "bg-gray-100 text-gray-700";

						return (
							<div
								key={application.job_application_id}
								className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<div>
										<h3 className="text-lg poppins-semibold text-gray-900">
											{job.title}
										</h3>
										<p className="text-sm text-gray-600 poppins-regular">
											{job.Employer?.company_name || "Unknown company"}
										</p>
										<p className="text-xs text-gray-400 poppins-regular mt-1">
											Applied on {new Date(application.createdAt).toLocaleDateString()}
										</p>
									</div>
									<span className={`px-3 py-1 rounded-full text-xs poppins-semibold ${statusClass}`}>
										{application.status.replace(/_/g, " ").toUpperCase()}
									</span>
								</div>

								{job.JobRequirements && job.JobRequirements.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm poppins-medium text-gray-700">
											Required Documents
										</p>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{job.JobRequirements.map((req) => renderRequirement(req, application))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ApplicationsTab;

