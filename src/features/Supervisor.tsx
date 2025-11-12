import { useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";

import { AiOutlineUser } from "react-icons/ai";
import { MdWorkOutline, MdAssignment } from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi";
import { FiCheckCircle } from "react-icons/fi";

import ProfileTab from "./supervisor/tabs/ProfileTab";
import InternshipListingTab from "./supervisor/tabs/InternshipListingTab";
import InternsTab from "./supervisor/tabs/InternsTab";
import StatusAndOeamTab from "./supervisor/tabs/StatusAndOeamTab";
import ReportsTab from "./supervisor/tabs/ReportsTab";

const Supervisor = () => {
	const [activeTab, setActiveTab] = useState("profile");

	const tabs = [
		{ id: "profile", label: "Profile", icon: <AiOutlineUser size={20} /> },
		{ id: "internships", label: "Internship Listings", icon: <MdWorkOutline size={20} /> },
		{ id: "interns", label: "Interns", icon: <HiOutlineUsers size={20} /> },
		{ id: "status", label: "Status & OEAMS", icon: <FiCheckCircle size={20} /> },
		{ id: "reports", label: "Reports", icon: <MdAssignment size={20} /> },
	];

	return (
		<section className="supervisor-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md rounded-md overflow-hidden">
				<HeaderLayout bannerName={"supervisor"} />
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
					{activeTab === "profile" && <ProfileTab />}
					{activeTab === "internships" && <InternshipListingTab />}
					{activeTab === "interns" && <InternsTab />}
					{activeTab === "status" && <StatusAndOeamTab />}
					{activeTab === "reports" && <ReportsTab />}
				</div>
			</div>
		</section>
	);
};

export default Supervisor;

