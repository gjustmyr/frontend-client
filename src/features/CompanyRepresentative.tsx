import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

// React Icons
import { AiOutlineUser } from "react-icons/ai";
import { MdWorkOutline } from "react-icons/md";
import { BsFileText } from "react-icons/bs";

import ProfileTab from "./company-representative/tabs/ProfileTab";
import PostInternshipTab from "./company-representative/tabs/PostInternshipTab";
import ApplicationsTab from "./company-representative/tabs/ApplicationsTab";

const CompanyRepresentative = () => {
	const [activeTab, setActiveTab] = useState("profile");

	const tabs = [
		{
			id: "profile",
			label: "Profile",
			icon: <AiOutlineUser size={20} />,
		},
		{
			id: "post-internship",
			label: "Post Internship",
			icon: <MdWorkOutline size={20} />,
		},
		{
			id: "applications",
			label: "Applications",
			icon: <BsFileText size={20} />,
		},
	];

	return (
		<section className="company-representative-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"company-representative"} />

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
					{activeTab === "profile" && <ProfileTab />}

					{activeTab === "post-internship" && <PostInternshipTab />}

					{activeTab === "applications" && <ApplicationsTab />}
				</div>
			</div>
		</section>
	);
};

export default CompanyRepresentative;

