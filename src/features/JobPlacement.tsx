import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

import { AiOutlineDashboard } from "react-icons/ai";
import { MdBusiness, MdChecklistRtl } from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi";
import { FiMessageSquare } from "react-icons/fi";

import DashboardTab from "./job-placement/tabs/DashboardTab";
import JobApprovalsTab from "./job-placement/tabs/JobApprovalsTab";
import AlumniTab from "./job-placement/tabs/AlumniTab";
import EmployerTabs from "./ojt-heads/tabs/EmployersTab";
import MessagesTab from "./messages/components/MessagesTab";

const JobPlacement = () => {
	const [activeTab, setActiveTab] = useState("dashboard");

	const tabs = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: <AiOutlineDashboard size={20} />,
		},
		{
			id: "job-approvals",
			label: "Job Approvals",
			icon: <MdChecklistRtl size={20} />,
		},
		{
			id: "employers",
			label: "Employers",
			icon: <MdBusiness size={20} />,
		},
		{
			id: "alumni",
			label: "Alumni",
			icon: <HiOutlineUsers size={20} />,
		},
		{
			id: "messages",
			label: "Messages",
			icon: <FiMessageSquare size={20} />,
		},
	];

	return (
		<section className="job-placement-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"job-placement"} />
				<UserBar />

				<div className="flex justify-start border-b border-gray-200 bg-gray-50 flex-wrap">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 py-3 px-6 text-sm poppins-medium transition duration-300 cursor-pointer ${
								activeTab === tab.id
									? "border-b-4 border-green-600 text-green-700 bg-white"
									: "text-gray-600 hover:text-green-700 hover:bg-gray-100"
							}`}>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				<div className="p-6 bg-white min-h-[400px]">
					{activeTab === "dashboard" && <DashboardTab />}
					{activeTab === "job-approvals" && <JobApprovalsTab />}
					{activeTab === "employers" && <EmployerTabs />}
					{activeTab === "alumni" && <AlumniTab />}
					{activeTab === "messages" && <MessagesTab />}
				</div>
			</div>
		</section>
	);
};

export default JobPlacement;

