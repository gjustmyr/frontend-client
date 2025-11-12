import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiClock } from "react-icons/fi";
import Swal from "sweetalert2";
import { getCurrentUser } from "../utils/auth.utils";
import { getRole } from "../utils/role.utils";

const UserBar = () => {
	const navigate = useNavigate();
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleLogout = () => {
		Swal.fire({
			title: "Logout?",
			text: "Are you sure you want to logout?",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Yes, logout",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				// Get user role before clearing token
				const user = getCurrentUser();
				let loginPath = "ojt-head"; // Default fallback

				if (user?.role) {
					// Map backend role to frontend login path
					const rolePathMap: Record<string, string> = {
						"ojt-head": "ojt-head",
						"ojt-coordinator": "ojt-coordinator",
						employer: "company-representative",
						"student-trainee": "student-trainee",
						superadmin: "super-admin",
						"job-placement-head": "job-placement",
						supervisor: "training-supervisor",
						alumni: "alumni",
					};
					loginPath = rolePathMap[user.role] || "ojt-head";
				}

				// Clear token
				localStorage.removeItem("authToken");

				// Show success message
				Swal.fire({
					icon: "success",
					title: "Logged Out",
					text: "You have been successfully logged out",
					timer: 1500,
					showConfirmButton: false,
				});

				// Redirect to login page
				setTimeout(() => {
					navigate(`/${loginPath}/login`, { replace: true });
				}, 1500);
			}
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const user = getCurrentUser();

	return (
		<div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 flex items-center justify-between border-b border-green-800">
			{/* Current Time */}
			<div className="flex items-center gap-3 text-white">
				<FiClock size={18} className="text-green-100" />
				<div>
					<div className="text-sm poppins-medium text-green-100">
						{formatDate(currentTime)}
					</div>
					<div className="text-lg poppins-semibold">
						{formatTime(currentTime)}
					</div>
				</div>
			</div>

			{/* User Info and Logout */}
			<div className="flex items-center gap-4">
				{user && (
					<div className="text-right text-white">
						<div className="text-xs poppins-regular text-green-100">
							Logged in as
						</div>
						<div className="text-sm poppins-semibold">
							{getRole(user.role)}
						</div>
					</div>
				)}
				<button
					onClick={handleLogout}
					className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 rounded hover:bg-green-50 transition-colors poppins-medium shadow-sm">
					<FiLogOut size={18} />
					Logout
				</button>
			</div>
		</div>
	);
};

export default UserBar;

