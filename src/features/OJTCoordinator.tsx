import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

// React Icons
import { AiOutlineDashboard } from "react-icons/ai";
import { FaUniversity } from "react-icons/fa";
import { MdBusiness } from "react-icons/md";
import { FiMessageSquare } from "react-icons/fi";
import { BsFileText } from "react-icons/bs";

import ClassListingTab from "./ojt-coordinator/tabs/ClassListingTab";
import OJTRequirementsViewOnlyTab from "./ojt-coordinator/tabs/OJTRequirementsViewOnlyTab";
import EmployersViewOnlyTab from "./ojt-coordinator/tabs/EmployersViewOnlyTab";
import MessagesTab from "./messages/components/MessagesTab";
import DashboardTab from "./ojt-coordinator/tabs/DashboardTab";

const OJTCoordinator = () => {
	const [activeTab, setActiveTab] = useState("dashboard");

	const tabs = [
		{
			id: "dashboard",
			label: "Dashboard",
			icon: <AiOutlineDashboard size={20} />,
		},
		{
			id: "class-listing",
			label: "Class Listing (Semestral Internship)",
			icon: <FaUniversity size={20} />,
		},
		{
			id: "ojt-requirements",
			label: "OJT Requirements",
			icon: <BsFileText size={20} />,
		},
		{
			id: "employers",
			label: "Employers",
			icon: <MdBusiness size={20} />,
		},
		{
			id: "messages",
			label: "Messages",
			icon: <FiMessageSquare size={20} />,
		},
	];

	return (
		<section className="ojt-coordinator-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"ojt-coordinator"} />

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
							}`}>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				{/* Tab Content */}
				<div className="p-6 bg-white min-h-[400px]">
					{activeTab === "dashboard" && <DashboardTab />}

					{activeTab === "class-listing" && <ClassListingTab />}

					{activeTab === "ojt-requirements" && <OJTRequirementsViewOnlyTab />}

					{activeTab === "employers" && <EmployersViewOnlyTab />}

					{activeTab === "messages" && <MessagesTab />}
				</div>
			</div>
		</section>
	);
};

export default OJTCoordinator;

