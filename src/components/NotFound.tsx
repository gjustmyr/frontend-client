import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import { getCurrentUser } from "../utils/auth.utils";

const NotFound = () => {
	const navigate = useNavigate();
	const currentUser = getCurrentUser();

	const handleGoHome = () => {
		if (currentUser) {
			// Redirect to user's dashboard based on role
			const roleRoutes: { [key: string]: string } = {
				"ojt-head": "/ojt-head",
				"ojt-coordinator": "/ojt-coordinator",
				"employer": "/company-representative",
				"student-trainee": "/student-trainee",
				"super-admin": "/super-admin",
				"job-placement": "/job-placement",
				"training-supervisor": "/training-supervisor",
				"alumni": "/alumni",
			};
			const route = roleRoutes[currentUser.role] || "/";
			navigate(route);
		} else {
			// Redirect to login
			navigate("/login");
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
			<div className="max-w-md w-full text-center">
				<div className="bg-white rounded-lg shadow-lg p-8">
					{/* 404 Icon/Number */}
					<div className="mb-6">
						<h1 className="text-9xl font-bold text-gray-300 poppins-bold">404</h1>
					</div>

					{/* Error Message */}
					<h2 className="text-2xl poppins-semibold text-gray-800 mb-3">
						Page Not Found
					</h2>
					<p className="text-gray-600 poppins-regular mb-8">
						The page you are looking for does not exist or has been moved.
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							onClick={() => navigate(-1)}
							className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors poppins-medium flex items-center justify-center gap-2">
							<FiArrowLeft size={18} />
							Go Back
						</button>
						<button
							onClick={handleGoHome}
							className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors poppins-medium flex items-center justify-center gap-2">
							<FiHome size={18} />
							Go to Dashboard
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;



