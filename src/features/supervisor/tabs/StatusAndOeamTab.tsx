import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
	getSupervisorInterns,
	getInternAttendance,
	verifyAttendance,
	modifyAttendance,
} from "../../../services/supervisor.service";

interface AttendanceRecord {
	attendance_id: number;
	date: string;
	time_in: string | null;
	time_out: string | null;
	working_arrangement: string | null;
	task_for_day: string | null;
	accomplishments: string | null;
	hours_worked: number | null;
	is_verified: boolean;
	is_modified: boolean;
	modification_notes?: string | null;
}

const StatusAndOeamTab = () => {
	const [interns, setInterns] = useState<any[]>([]);
	const [selectedInternId, setSelectedInternId] = useState<number | null>(null);
	const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [attendanceLoading, setAttendanceLoading] = useState(false);
	const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
	const [editForm, setEditForm] = useState({
		time_in: "",
		time_out: "",
		working_arrangement: "",
		task_for_day: "",
		accomplishments: "",
		hours_worked: "",
		modification_notes: "",
	});

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
				text: error.message || "Failed to load interns",
			});
		} finally {
			setLoading(false);
		}
	};

	const fetchAttendance = async (studentInternshipId: number) => {
		try {
			setAttendanceLoading(true);
			const data = await getInternAttendance(studentInternshipId);
			setAttendance(data || []);
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load attendance logs",
			});
			setAttendance([]);
		} finally {
			setAttendanceLoading(false);
		}
	};

	useEffect(() => {
		fetchInterns();
	}, []);

	useEffect(() => {
		if (selectedInternId) {
			fetchAttendance(selectedInternId);
		}
	}, [selectedInternId]);

	const selectedIntern = useMemo(
		() => interns.find((item) => item.student_internship_id === selectedInternId),
		[interns, selectedInternId]
	);

	const handleVerify = async (record: AttendanceRecord) => {
		try {
			await verifyAttendance(record.attendance_id);
			Swal.fire({
				icon: "success",
				title: "Verified",
				text: "Attendance was marked as verified.",
				timer: 1800,
				showConfirmButton: false,
			});
			if (selectedInternId) {
				fetchAttendance(selectedInternId);
			}
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Verification Failed",
				text: error.message || "Unable to verify attendance.",
			});
		}
	};

	const openEditModal = (record: AttendanceRecord) => {
		setEditingRecord(record);
		setEditForm({
			time_in: record.time_in || "",
			time_out: record.time_out || "",
			working_arrangement: record.working_arrangement || "",
			task_for_day: record.task_for_day || "",
			accomplishments: record.accomplishments || "",
			hours_worked: record.hours_worked?.toString() || "",
			modification_notes: record.modification_notes || "",
		});
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSaveEdit = async () => {
		if (!editingRecord) return;
		try {
			await modifyAttendance(editingRecord.attendance_id, {
				time_in: editForm.time_in || undefined,
				time_out: editForm.time_out || undefined,
				working_arrangement: editForm.working_arrangement || undefined,
				task_for_day: editForm.task_for_day,
				accomplishments: editForm.accomplishments,
				hours_worked: editForm.hours_worked ? parseFloat(editForm.hours_worked) : undefined,
				modification_notes: editForm.modification_notes || undefined,
			});
			Swal.fire({
				icon: "success",
				title: "Updated",
				text: "Attendance log updated successfully.",
				timer: 2000,
				showConfirmButton: false,
			});
			setEditingRecord(null);
			if (selectedInternId) {
				fetchAttendance(selectedInternId);
			}
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Update Failed",
				text: error.message || "Could not update the attendance log.",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading intern data...</div>
			</div>
		);
	}

	if (interns.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500 poppins-regular">
				No interns assigned yet. Once interns are assigned, their OEAMS logs will appear here.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-2xl poppins-semibold text-gray-800">Status &amp; OEAMS</h2>
					<p className="text-gray-600 poppins-regular">
						Review daily logs, verify attendance, and leave remarks when you correct records.
					</p>
				</div>
				<div>
					<select
						value={selectedInternId ?? ""}
						onChange={(e) => setSelectedInternId(Number(e.target.value))}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 poppins-regular">
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
				</div>
			</div>

		{
			selectedIntern && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
					<div>
						<p className="text-xs text-gray-500 uppercase poppins-medium">Status</p>
						<p className="text-lg poppins-semibold text-gray-800">
							{selectedIntern.status?.replace(/-/g, " ").toUpperCase() || "N/A"}
						</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 uppercase poppins-medium">Total Hours</p>
						<p className="text-lg poppins-semibold text-gray-800">{selectedIntern.ojt_hours ?? 0}</p>
					</div>
					<div>
						<p className="text-xs text-gray-500 uppercase poppins-medium">Raw Grade</p>
						<p className="text-lg poppins-semibold text-gray-800">{selectedIntern.raw_grade ?? "—"}</p>
					</div>
				</div>
			)
		}

			<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
				<div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
					<h3 className="text-lg poppins-semibold text-gray-800">Daily Logs</h3>
					{selectedIntern && (
						<p className="text-xs text-gray-500 poppins-regular">
							Student Internship ID: {selectedIntern.student_internship_id}
						</p>
					)}
				</div>

				{attendanceLoading ? (
					<div className="flex justify-center items-center py-10">
						<p className="text-gray-500 poppins-regular">Loading logs...</p>
					</div>
				) : attendance.length === 0 ? (
					<div className="text-center py-8 text-gray-500 poppins-regular">
						No OEAMS records yet for this intern.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full border-collapse text-sm">
							<thead className="bg-gray-100 text-left poppins-semibold text-gray-700">
								<tr>
									<th className="px-4 py-2">Date</th>
									<th className="px-4 py-2">Time In</th>
									<th className="px-4 py-2">Time Out</th>
									<th className="px-4 py-2">Hours</th>
									<th className="px-4 py-2">Work Arrangement</th>
									<th className="px-4 py-2">Tasks</th>
									<th className="px-4 py-2">Accomplishments</th>
									<th className="px-4 py-2 text-center">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 poppins-regular text-gray-700">
								{attendance.map((record) => (
									<tr key={record.attendance_id}>
										<td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
										<td className="px-4 py-3">{record.time_in || "—"}</td>
										<td className="px-4 py-3">{record.time_out || "—"}</td>
										<td className="px-4 py-3">{record.hours_worked ?? 0}</td>
										<td className="px-4 py-3">{record.working_arrangement || "—"}</td>
										<td className="px-4 py-3">{record.task_for_day || "—"}</td>
										<td className="px-4 py-3">{record.accomplishments || "—"}</td>
										<td className="px-4 py-3 text-center space-x-2">
											<button
												onClick={() => handleVerify(record)}
												className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
												disabled={record.is_verified}>
												Verify
											</button>
											<button
												onClick={() => openEditModal(record)}
												className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
												Edit
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{editingRecord && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="text-lg poppins-semibold text-gray-800">
								Edit Attendance – {new Date(editingRecord.date).toLocaleDateString()}
							</h4>
							<button
								onClick={() => setEditingRecord(null)}
								className="text-sm text-gray-500 hover:text-gray-700">
								Close
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="text-sm poppins-medium text-gray-600">
								Time In
								<input
									type="time"
									name="time_in"
									value={editForm.time_in}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</label>
							<label className="text-sm poppins-medium text-gray-600">
								Time Out
								<input
									type="time"
									name="time_out"
									value={editForm.time_out}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</label>
							<label className="text-sm poppins-medium text-gray-600">
								Working Arrangement
								<select
									name="working_arrangement"
									value={editForm.working_arrangement}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
									<option value="">Select...</option>
									<option value="Work From Home">Work From Home</option>
									<option value="Skeletal Workforce">Skeletal Workforce</option>
									<option value="On Site">On Site</option>
								</select>
							</label>
							<label className="text-sm poppins-medium text-gray-600">
								Hours Worked
								<input
									type="number"
									step="0.01"
									name="hours_worked"
									value={editForm.hours_worked}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</label>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="text-sm poppins-medium text-gray-600">
								Task for the Day
								<textarea
									name="task_for_day"
									value={editForm.task_for_day}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</label>
							<label className="text-sm poppins-medium text-gray-600">
								Accomplishments
								<textarea
									name="accomplishments"
									value={editForm.accomplishments}
									onChange={handleEditChange}
									className="mt-1 w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</label>
						</div>
						<label className="text-sm poppins-medium text-gray-600 block">
							Remarks (explain corrections)
							<textarea
								name="modification_notes"
								value={editForm.modification_notes}
								onChange={handleEditChange}
								placeholder="Describe why this entry was corrected."
								className="mt-1 w-full border border-gray-300 rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</label>

						<div className="flex justify-end gap-2">
							<button
								onClick={() => setEditingRecord(null)}
								className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 poppins-medium">
								Cancel
							</button>
							<button
								onClick={handleSaveEdit}
								className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 poppins-medium">
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default StatusAndOeamTab;

