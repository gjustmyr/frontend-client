import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

import { BsFileText } from "react-icons/bs";
import { FiMessageSquare } from "react-icons/fi";

import RequirementsTab from "./student-trainee/tabs/RequirementsTab";
import MessagesTab from "./messages/components/MessagesTab";

const StudentTrainee = () => {
	const [activeTab, setActiveTab] = useState("requirements");

	const tabs = [
		{
			id: "requirements",
			label: "OJT Requirements",
			icon: <BsFileText size={20} />,
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
							}`}>
							{tab.icon} {tab.label}
						</button>
					))}
				</div>

				{/* Tab Content */}
				<div className="p-6 bg-white min-h-[400px]">
					{activeTab === "requirements" && <RequirementsTab />}

					{activeTab === "messages" && <MessagesTab />}
				</div>
			</div>
		</section>
	);
};

export default StudentTrainee;

