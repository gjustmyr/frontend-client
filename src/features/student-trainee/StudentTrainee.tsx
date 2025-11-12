import { useState, useEffect } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

import { BsFileText } from "react-icons/bs";
import { FiMessageSquare, FiDownloadCloud, FiClock } from "react-icons/fi";
import { MdWork } from "react-icons/md";

import RequirementsTab from "./tabs/RequirementsTab";
import RequirementTemplatesTab from "./tabs/RequirementTemplatesTab";
import MessagesTab from "../messages/components/MessagesTab";
import JobRecommendationsTab from "./tabs/JobRecommendationsTab";
import OEAMSTab from "./tabs/OEAMSTab";
import { getMyStudentInternship, type StudentInternship } from "../../services/student-internship.service";

const StudentTrainee = () => {
	const [activeTab, setActiveTab] = useState("requirements");
	const [studentInternship, setStudentInternship] = useState<StudentInternship | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchInternship = async () => {
			try {
				const data = await getMyStudentInternship();
				setStudentInternship(data);
			} catch (error) {
				console.error("Error fetching student internship:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchInternship();
	}, []);

	// Check if OJT status is ongoing to show OEAMS tab
	const showOEAMSTab = studentInternship?.status === "ongoing" || studentInternship?.status === "post-ojt";

	const tabs = [
		{
			id: "requirements",
			label: "OJT Requirements",
			icon: <BsFileText size={20} />,
		},
		...(showOEAMSTab
			? [
					{
						id: "oeams",
						label: "OEAMS",
						icon: <FiClock size={20} />,
					},
			  ]
			: []),
		{
			id: "templates",
			label: "Templates",
			icon: <FiDownloadCloud size={20} />,
		},
		{
			id: "job-matches",
			label: "Job Matches",
			icon: <MdWork size={20} />,
		},
		{
			id: "messages",
			label: "Messages",
			icon: <FiMessageSquare size={20} />,
		},
	];

	return (
		<section className="student-trainee-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"student-trainee"} />

				{/* User Bar with Time and Logout */}
				<UserBar />

				{/* Tabs */}
				<div className="flex justify-start border-b border-gray-200 bg-gray-50 flex-wrap">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 py-3 px-6 text-sm poppins-medium transition duration-300 cursor-pointer ${
								activeTab === tab.id
									? "border-b-4 border-green-600 text-green-700 bg-white"
									: "text-gray-600 hover:text-green-700 hover:bg-gray-100"
								}`}
						>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				{/* Tab Content */}
				<div className="p-6 bg-white min-h-[400px]">
					{activeTab === "requirements" && <RequirementsTab />}
					{activeTab === "oeams" && showOEAMSTab && <OEAMSTab />}
					{activeTab === "templates" && <RequirementTemplatesTab />}
					{activeTab === "job-matches" && <JobRecommendationsTab />}
					{activeTab === "messages" && <MessagesTab />}
				</div>
			</div>
		</section>
	);
};

export default StudentTrainee;

