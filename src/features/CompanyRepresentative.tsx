import { useEffect, useMemo, useState } from "react";
import HeaderLayout from "../layouts/HeaderLayout";
import UserBar from "../components/UserBar";
import Swal from "sweetalert2";

// React Icons
import { AiOutlineUser } from "react-icons/ai";
import { MdBusinessCenter, MdWorkOutline } from "react-icons/md";
import { BsFileText } from "react-icons/bs";

import ProfileTab from "./company-representative/tabs/ProfileTab";
import PostInternshipTab, { PostJobOpeningTab } from "./company-representative/tabs/PostInternshipTab";
import ApplicationsTab from "./company-representative/tabs/ApplicationsTab";
import { getCurrentProfile } from "../services/employer.service";

const CompanyRepresentative = () => {
	const [activeTab, setActiveTab] = useState("profile");
	const [eligibility, setEligibility] = useState<string | null>(null);
	const [loadingEligibility, setLoadingEligibility] = useState(true);

	useEffect(() => {
		const fetchEligibility = async () => {
			try {
				setLoadingEligibility(true);
				const profile = await getCurrentProfile();
				setEligibility(profile?.eligibility || null);
			} catch (error: any) {
				console.error(error);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: error.message || "Failed to load employer profile",
				});
			} finally {
				setLoadingEligibility(false);
			}
		};

		fetchEligibility();
	}, []);

	const showInternshipTab = eligibility === "INTERNSHIP" || eligibility === "BOTH";
	const showJobTab = eligibility === "JOB-PLACEMENT" || eligibility === "BOTH";

	const tabs = useMemo(
		() => [
			{
				id: "profile",
				label: "Profile",
				icon: <AiOutlineUser size={20} />,
			},
			...(showInternshipTab
				? [
						{
							id: "post-internship",
							label: "Post Internship",
							icon: <MdWorkOutline size={20} />,
						},
				  ]
				: []),
			...(showJobTab
				? [
						{
							id: "post-job",
							label: "Post Job Opening",
							icon: <MdBusinessCenter size={20} />,
						},
				  ]
				: []),
			...(showInternshipTab
				? [
						{
							id: "applications",
							label: "Applications",
							icon: <BsFileText size={20} />,
						},
				  ]
				: []),
		],
		[showInternshipTab, showJobTab]
	);

	useEffect(() => {
		if (loadingEligibility) {
			return;
		}

		const availableTabIds = tabs.map((tab) => tab.id);
		if (!availableTabIds.includes(activeTab) && availableTabIds.length > 0) {
			setActiveTab(availableTabIds[0]);
		}
	}, [activeTab, loadingEligibility, tabs]);

	const isProfileTab = activeTab === "profile";

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
					{loadingEligibility && !isProfileTab ? (
						<div className="text-center py-10 text-gray-500">
							Loading employer workspace...
						</div>
					) : (
						<>
							{activeTab === "profile" && <ProfileTab />}
							{activeTab === "post-internship" && showInternshipTab && <PostInternshipTab />}
							{activeTab === "post-job" && showJobTab && <PostJobOpeningTab />}
							{activeTab === "applications" && showInternshipTab && <ApplicationsTab />}
						</>
					)}
				</div>
			</div>
		</section>
	);
};

export default CompanyRepresentative;

