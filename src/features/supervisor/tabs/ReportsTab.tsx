import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
	getSupervisorInterns,
	markInternshipAsDone,
	submitAppraisalReport,
} from "../../../services/supervisor.service";

const ReportsTab = () => {
	const [interns, setInterns] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedInternId, setSelectedInternId] = useState<number | null>(null);
	const [reportFile, setReportFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [marking, setMarking] = useState(false);

	const fetchInterns = async () => {
		try {
			setLoading(true);
			const data = await getSupervisorInterns();
			setInterns(data || []);
			if (data && data.length > 0) {
				setSelectedInternId(data[0].student_internship_id);
			}
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load intern list",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInterns();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type !== "application/pdf") {
			Swal.fire({
				icon: "warning",
				title: "Invalid file",
				text: "Please upload a PDF document.",
			});
			return;
		}
		setReportFile(file || null);
	};

	const selectedIntern = useMemo(
		() => interns.find((internship) => internship.student_internship_id === selectedInternId) || null,
		[interns, selectedInternId]
	);

	const handleSubmitReport = async () => {
		if (!selectedInternId) {
			Swal.fire({
				icon: "warning",
				title: "Select an intern",
				text: "Choose an intern before submitting a report.",
			});
			return;
		}
		if (!reportFile) {
			Swal.fire({
				icon: "warning",
				title: "No file selected",
				text: "Please attach the appraisal PDF before submitting.",
			});
			return;
		}
		try {
			setUploading(true);
			await submitAppraisalReport(selectedInternId, reportFile);
			Swal.fire({
				icon: "success",
				title: "Appraisal Uploaded",
				text: "The appraisal report was submitted successfully.",
				timer: 2000,
				showConfirmButton: false,
			});
			setReportFile(null);
			fetchInterns();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Upload Failed",
				text: error.message || "Could not submit the appraisal report.",
			});
		} finally {
			setUploading(false);
		}
	};

	const handleMarkDone = async () => {
		if (!selectedInternId) {
			Swal.fire({
				icon: "warning",
				title: "Select an intern",
				text: "Choose an intern to mark as completed.",
			});
		 return;
		}
		try {
			setMarking(true);
			await markInternshipAsDone(selectedInternId);
			Swal.fire({
				icon: "success",
				title: "Marked as Done",
				text: "The intern was marked as post-OJT.",
				timer: 2000,
				showConfirmButton: false,
			});
			fetchInterns();
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Action Failed",
				text: error.message || "Unable to mark the intern as done.",
			});
		} finally {
			setMarking(false);
		}
	};

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
				No interns available for reporting yet.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl poppins-semibold text-gray-800">Appraisal &amp; Close-out</h2>
				<p className="text-gray-600 poppins-regular">
					Upload the appraisal PDF and mark internships as completed once the evaluation is finished. These actions will connect to the final evaluation workflow in a later release.
				</p>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<label className="text-sm poppins-medium text-gray-700">
						Select Intern
						<select
							value={selectedInternId ?? ""}
							onChange={(e) => setSelectedInternId(Number(e.target.value))}
							className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 poppins-regular">
							{interns.map((internship) => {
								const trainee = internship.StudentTrainee;
								const name = [
									trainee?.first_name,
									trainee?.middle_name,
									trainee?.last_name,
								]
									.filter(Boolean)
									.join(" ");
								return (
									<option key={internship.student_internship_id} value={internship.student_internship_id}>
										{name || internship.student_internship_id}
									</option>
								);
							})}
						</select>
					</label>

					<div>
						<label className="text-sm poppins-medium text-gray-700 block">
							Appraisal Report (PDF)
						</label>
						<input type="file" accept="application/pdf" onChange={handleFileChange} />
						{selectedIntern?.appraisal_report_url && (
							<p className="text-xs text-green-600 poppins-regular mt-1">
								Current file on record. Uploading again will replace it.
							</p>
						)}
					</div>
				</div>

				{selectedIntern && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 poppins-regular">
						<div>
							<p className="font-semibold text-gray-700">Status</p>
							<p>{selectedIntern.status?.replace(/-/g, " ").toUpperCase()}</p>
						</div>
						<div>
							<p className="font-semibold text-gray-700">Appraisal Submitted</p>
							<p>
								{selectedIntern.appraisal_submitted_at
									? new Date(selectedIntern.appraisal_submitted_at).toLocaleString()
									: "Not yet"}
							</p>
						</div>
						<div>
							<p className="font-semibold text-gray-700">Marked Done</p>
							<p>
								{selectedIntern.supervisor_marked_done_at
									? new Date(selectedIntern.supervisor_marked_done_at).toLocaleString()
									: "Not yet"}
							</p>
						</div>
					</div>
				)}

				<div className="flex flex-col md:flex-row gap-3">
					<button
						onClick={handleSubmitReport}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 poppins-medium disabled:bg-gray-300"
						disabled={uploading}>
						{uploading ? "Uploading..." : "Upload Appraisal PDF"}
					</button>
					<button
						onClick={handleMarkDone}
						className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium disabled:bg-gray-300"
						disabled={marking || !selectedIntern?.appraisal_report_url}>
						{marking ? "Saving..." : "Mark OJT as Done"}
					</button>
				</div>

				<p className="text-xs text-gray-400 poppins-regular">
					The internship will move to post-OJT once marked done. Coordinators can submit raw grades afterwards.
				</p>
			</div>
		</div>
	);
};

export default ReportsTab;

