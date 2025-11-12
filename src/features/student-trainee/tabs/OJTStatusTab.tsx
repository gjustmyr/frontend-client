import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getMyStudentInternship, type StudentInternship } from "../../../services/student-internship.service";
import { FiCalendar, FiPrinter, FiClock } from "react-icons/fi";

const OJTStatusTab = () => {
	const [studentInternship, setStudentInternship] = useState<StudentInternship | null>(null);
	const [loading, setLoading] = useState(true);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [workArrangement, setWorkArrangement] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getMyStudentInternship();
				setStudentInternship(data);
				
				// Set default date range to current month
				const now = new Date();
				const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
				const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				setStartDate(formatDateForInput(firstDay));
				setEndDate(formatDateForInput(lastDay));
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
	}, []);

	const formatDateForInput = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const formatDateDisplay = (dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatStatus = (status: string): string => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const getStatusColor = (status: string): string => {
		switch (status) {
			case "ongoing":
				return "bg-blue-100 text-blue-700";
			case "completed":
				return "bg-green-100 text-green-700";
			case "pre-ojt":
				return "bg-yellow-100 text-yellow-700";
			case "post-ojt":
				return "bg-purple-100 text-purple-700";
			case "dropped":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const handlePrint = () => {
		window.print();
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
				<p className="poppins-regular text-sm mt-2">
					Please contact your OJT Coordinator to be assigned to an internship.
				</p>
			</div>
		);
	}

	// Calculate dates (assuming 3 months OJT period)
	const ojtStartDate = studentInternship.createdAt
		? new Date(studentInternship.createdAt)
		: new Date();
	const ojtEndDate = new Date(ojtStartDate);
	ojtEndDate.setMonth(ojtEndDate.getMonth() + 3);

	const requiredHours = 486; // Default required hours
	const accomplishedHours = studentInternship.ojt_hours || 0;
	const remainingHours = Math.max(0, requiredHours - accomplishedHours);
	const progressPercentage = Math.min(100, (accomplishedHours / requiredHours) * 100);

	// Mock time log data - in real implementation, this would come from API
	const timeLogEntries = [
		{
			day: "Mon",
			date: "06/13/2025",
			workArrangement: "Work From Home",
			timeIn: "7:58 AM",
			timeOut: "5:14 PM",
			accomplishment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
		},
		{
			day: "Mon",
			date: "06/13/2025",
			workArrangement: "Work From Home",
			timeIn: "7:58 AM",
			timeOut: "5:14 PM",
			accomplishment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
		},
	];

	const totalHours = 16; // Mock total hours

	return (
		<div className="space-y-6">
			<h2 className="text-2xl poppins-semibold text-gray-800 mb-4">OJT Status Overview</h2>

			{/* OJT Status Information */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">
							ASSIGNED COMPANY
						</label>
						<p className="text-lg poppins-semibold text-gray-800">
							{studentInternship.supervisor?.employer?.company_name || "Not assigned"}
						</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">
							OJT COORDINATOR
						</label>
						<p className="text-lg poppins-semibold text-gray-800">
							{/* Coordinator name would come from API */}
							Juan C. Dela Cruz
						</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">
							OJT START DATE
						</label>
						<p className="text-lg poppins-semibold text-gray-800">
							{formatDateDisplay(ojtStartDate.toISOString())}
						</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">
							PRESUMED END DATE
						</label>
						<p className="text-lg poppins-semibold text-gray-800">
							{formatDateDisplay(ojtEndDate.toISOString())}
						</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">
							OJT SCHEDULE
						</label>
						<p className="text-lg poppins-semibold text-gray-800">Mon-Fri 8:00 AM - 5:00 PM</p>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-600 mb-1">STATUS</label>
						<span
							className={`inline-block px-3 py-1 rounded-full text-sm poppins-semibold ${getStatusColor(
								studentInternship.status
							)}`}>
							{formatStatus(studentInternship.status)}
						</span>
					</div>
				</div>
			</div>

			{/* Overall Progress */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Overall Progress</h3>
				<div className="mb-4">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm poppins-regular text-gray-600">
							{progressPercentage.toFixed(0)}% of required hours completed
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-4">
						<div
							className="bg-green-600 h-4 rounded-full transition-all duration-300"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm poppins-regular text-gray-600 mb-1">TOTAL REQUIRED HOURS</p>
						<p className="text-2xl poppins-semibold text-blue-700">{requiredHours}</p>
					</div>
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<p className="text-sm poppins-regular text-gray-600 mb-1">ACCOMPLISHED</p>
						<p className="text-2xl poppins-semibold text-green-700">{accomplishedHours}</p>
					</div>
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p className="text-sm poppins-regular text-gray-600 mb-1">REMAINING</p>
						<p className="text-2xl poppins-semibold text-yellow-700">{remainingHours}</p>
					</div>
				</div>
			</div>

			{/* Time Log Entry Section */}
			<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
				<h3 className="text-lg poppins-semibold text-gray-800 mb-4">Time Log Entry</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-2">
							Start Date
						</label>
						<div className="relative">
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular"
							/>
							<FiCalendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
						</div>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-2">End Date</label>
						<div className="relative">
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular"
							/>
							<FiCalendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
						</div>
					</div>
					<div>
						<label className="block text-sm poppins-medium text-gray-700 mb-2">
							Work Arrangement
						</label>
						<select
							value={workArrangement}
							onChange={(e) => setWorkArrangement(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 poppins-regular">
							<option value="">Choose arrangement</option>
							<option value="Work From Home">Work From Home</option>
							<option value="Skeletal Workforce">Skeletal Workforce</option>
						</select>
					</div>
					<div className="flex items-end">
						<button
							onClick={handlePrint}
							className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors poppins-medium flex items-center justify-center gap-2">
							<FiPrinter size={18} />
							Print
						</button>
					</div>
				</div>

				{/* Time Log Table */}
				<div className="mt-6">
					<h4 className="text-md poppins-semibold text-gray-800 mb-4">
						For the period {formatDateDisplay(startDate)} to {formatDateDisplay(endDate)}
					</h4>
					<div className="overflow-x-auto">
						<table className="w-full border border-gray-300">
							<thead>
								<tr className="bg-orange-100">
									<th colSpan={3} className="border border-gray-300 p-3 text-left text-sm poppins-semibold text-gray-800">
										Personnel Information
									</th>
								</tr>
								<tr className="bg-orange-50">
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Name of Personnel
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Position/Designation
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Department
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
										Gutierrez, Justmyr D.
									</td>
									<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
										Programmer
									</td>
									<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
										SecDev Department
									</td>
								</tr>
							</tbody>
						</table>

						<table className="w-full border border-gray-300 mt-4">
							<thead>
								<tr className="bg-gray-100">
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Day
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Date
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Work Arrangement
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Time In
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Time Out
									</th>
									<th className="border border-gray-300 p-2 text-left text-xs poppins-medium text-gray-700">
										Accomplishment
									</th>
								</tr>
							</thead>
							<tbody>
								{timeLogEntries.length > 0 ? (
									timeLogEntries.map((entry, index) => (
										<tr key={index} className="hover:bg-gray-50">
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.day}
											</td>
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.date}
											</td>
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.workArrangement}
											</td>
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.timeIn}
											</td>
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.timeOut}
											</td>
											<td className="border border-gray-300 p-2 text-sm poppins-regular text-gray-800">
												{entry.accomplishment}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={6} className="border border-gray-300 p-4 text-center text-sm poppins-regular text-gray-500">
											No time log entries found for the selected period
										</td>
									</tr>
								)}
							</tbody>
							<tfoot>
								<tr className="bg-gray-50">
									<td colSpan={5} className="border border-gray-300 p-2 text-right text-sm poppins-semibold text-gray-800">
										Total No. of Hours:
									</td>
									<td className="border border-gray-300 p-2 text-sm poppins-semibold text-gray-800">
										{totalHours} Hours
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OJTStatusTab;

