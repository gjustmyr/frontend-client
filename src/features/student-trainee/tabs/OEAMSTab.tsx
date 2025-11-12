import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMyStudentInternship, type StudentInternship } from "../../../services/student-internship.service";
import { FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

const OEAMSTab = () => {
	const [studentInternship, setStudentInternship] = useState<StudentInternship | null>(null);
	const [loading, setLoading] = useState(true);
	const [workingArrangement, setWorkingArrangement] = useState<string>("");
	const [timeIn, setTimeIn] = useState<string | null>(null);
	const [timeOut, setTimeOut] = useState<string | null>(null);
	const [referenceNumber, setReferenceNumber] = useState<string>("");
	const [taskForDay, setTaskForDay] = useState<string>("");
	const [accomplishments, setAccomplishments] = useState<string>("");
	const [systemInfo, setSystemInfo] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getMyStudentInternship();
				setStudentInternship(data);
			} catch (error: any) {
				console.error("Error fetching student internship:", error);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: error.message || "Failed to load internship data",
				});
			} finally {
				setLoading(false);
			}
		};
		fetchData();

		// Get system info
		const userAgent = navigator.userAgent;
		setSystemInfo(userAgent);
	}, []);

	const handleTimeIn = () => {
		if (!workingArrangement) {
			Swal.fire({
				icon: "warning",
				title: "Working Arrangement Required",
				text: "Please select your working arrangement before you time in.",
			});
			return;
		}

		const now = new Date();
		const timeString = now.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});

		// Generate reference number
		const refNum = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getTime()}-${Math.random().toString(36).substring(2, 15)}`;
		setReferenceNumber(refNum);
		setTimeIn(timeString);

		Swal.fire({
			icon: "success",
			title: "Time In Recorded",
			text: `Time in: ${timeString}`,
			timer: 2000,
			showConfirmButton: false,
		});
	};

	const handleTimeOut = () => {
		if (!timeIn) {
			Swal.fire({
				icon: "warning",
				title: "No Time In",
				text: "Please time in first before timing out.",
			});
			return;
		}

		const now = new Date();
		const timeString = now.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});

		setTimeOut(timeString);

		Swal.fire({
			icon: "success",
			title: "Time Out Recorded",
			text: `Time out: ${timeString}`,
			timer: 2000,
			showConfirmButton: false,
		});
	};

	const handleSaveAccomplishment = async () => {
		if (!timeIn) {
			Swal.fire({
				icon: "warning",
				title: "Time In Required",
				text: "Please time in first before saving accomplishments.",
			});
			return;
		}

		if (!taskForDay.trim() && !accomplishments.trim()) {
			Swal.fire({
				icon: "warning",
				title: "Empty Fields",
				text: "Please fill in at least one field (Task for the Day or Accomplishments).",
			});
			return;
		}

		try {
			// TODO: Implement API call to save accomplishments
			// await saveOEAMSAccomplishment({
			//   student_internship_id: studentInternship?.student_internship_id,
			//   working_arrangement: workingArrangement,
			//   time_in: timeIn,
			//   time_out: timeOut,
			//   task_for_day: taskForDay,
			//   accomplishments: accomplishments,
			//   reference_number: referenceNumber,
			//   date: new Date().toISOString().split('T')[0]
			// });

			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Accomplishment saved successfully",
				timer: 2000,
				showConfirmButton: false,
			});

			// Reset form after saving
			setTaskForDay("");
			setAccomplishments("");
		} catch (error: any) {
			console.error("Error saving accomplishment:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to save accomplishment",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10">
				<div className="text-gray-500 poppins-regular">Loading...</div>
			</div>
		);
	}

	if (!studentInternship) {
		return (
			<div className="text-center py-10 text-gray-500">
				<p className="poppins-regular">No internship data available.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Introduction */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<p className="text-sm poppins-regular text-gray-700">
					OEAMS provides access to evaluations, schedules, and reports. Please complete your daily log below.
				</p>
			</div>

			{/* Working Arrangement Selection */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">
					Please select your working arrangement before you time-in:
				</h3>
				<select
					value={workingArrangement}
					onChange={(e) => setWorkingArrangement(e.target.value)}
					className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular"
					disabled={!!timeIn}>
					<option value="">Choose arrangement</option>
					<option value="Work from Home">Work from Home</option>
					<option value="Skeletal Workforce">Skeletal Workforce</option>
				</select>
				{timeIn && (
					<p className="text-sm poppins-regular text-gray-600 mt-2">
						You can change your working arrangement from Work from Home (WFH) to Skeletal Workforce once inside the BatStateU campus.
					</p>
				)}
			</div>

			{/* Time In/Out Section */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">TIME IN / TIME OUT</h3>

				{referenceNumber && (
					<div className="mb-4">
						<p className="text-sm poppins-regular text-gray-600">
							<strong>REF:</strong> {referenceNumber}
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-2">TIME IN</label>
						<div className="flex items-center gap-3">
							{timeIn ? (
								<div className="flex items-center gap-2 text-green-600">
									<FiCheckCircle size={20} />
									<span className="poppins-semibold">{timeIn}</span>
								</div>
							) : (
								<div className="flex items-center gap-2 text-gray-400">
									<FiXCircle size={20} />
									<span className="poppins-regular">--:--</span>
								</div>
							)}
						</div>
						{systemInfo && timeIn && (
							<p className="text-xs poppins-regular text-gray-500 mt-1">{systemInfo}</p>
						)}
					</div>

					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-2">TIME OUT</label>
						<div className="flex items-center gap-3">
							{timeOut ? (
								<div className="flex items-center gap-2 text-green-600">
									<FiCheckCircle size={20} />
									<span className="poppins-semibold">{timeOut}</span>
								</div>
							) : (
								<div className="flex items-center gap-2 text-gray-400">
									<FiXCircle size={20} />
									<span className="poppins-regular">--:--</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex gap-3">
					{!timeIn ? (
						<button
							onClick={handleTimeIn}
							disabled={!workingArrangement}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium flex items-center gap-2">
							<FiClock size={18} />
							Time In
						</button>
					) : !timeOut ? (
						<button
							onClick={handleTimeOut}
							className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors poppins-medium flex items-center gap-2">
							<FiClock size={18} />
							Time Out
						</button>
					) : (
						<div className="text-sm poppins-regular text-gray-600">
							Completed for today
						</div>
					)}
				</div>
			</div>

			{/* Task for the Day */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<label className="block text-sm poppins-semibold text-gray-800 mb-3">Task for the Day</label>
				<textarea
					value={taskForDay}
					onChange={(e) => setTaskForDay(e.target.value)}
					placeholder="Enter your tasks for today..."
					rows={6}
					className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular resize-none"
				/>
			</div>

			{/* Accomplishments for the Day */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<label className="block text-sm poppins-semibold text-gray-800 mb-3">
					Accomplishments for the Day
				</label>
				<textarea
					value={accomplishments}
					onChange={(e) => setAccomplishments(e.target.value)}
					placeholder="Enter your accomplishments for today..."
					rows={6}
					className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular resize-none"
				/>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<button
					onClick={handleSaveAccomplishment}
					disabled={!timeIn || (!taskForDay.trim() && !accomplishments.trim())}
					className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium">
					Save Accomplishment
				</button>
			</div>
		</div>
	);
};

export default OEAMSTab;

