import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

// React Icons
import { AiOutlineUser } from "react-icons/ai";
import { MdWorkOutline } from "react-icons/md";
import { FiFileText } from "react-icons/fi";

import ProfileTab from "./alumni/tabs/ProfileTab";
import PostOJTTab from "./alumni/tabs/PostOJTTab";
import JobBoardTab from "./alumni/tabs/JobBoardTab";
import ApplicationsTab from "./alumni/tabs/ApplicationsTab";

const Alumni = () => {
	const [activeTab, setActiveTab] = useState("job-board");

	const tabs = [
		{
			id: "job-board",
			label: "Job Board",
			icon: <MdWorkOutline size={20} />,
		},
		{
			id: "applications",
			label: "My Applications",
			icon: <FiFileText size={20} />,
		},
		{
			id: "post-ojt",
			label: "Post OJT Opening",
			icon: <MdWorkOutline size={20} />,
		},
		{
			id: "profile",
			label: "Profile",
			icon: <AiOutlineUser size={20} />,
		},
	];

	return (
		<section className="alumni-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"alumni"} />

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
					{activeTab === "job-board" && <JobBoardTab />}
					{activeTab === "applications" && <ApplicationsTab />}
					{activeTab === "post-ojt" && <PostOJTTab />}
					{activeTab === "profile" && <ProfileTab />}
				</div>
			</div>
		</section>
	);
};

export default Alumni;

