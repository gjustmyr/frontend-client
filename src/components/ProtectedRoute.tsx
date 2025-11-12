import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, getRequiredRole, getRouteByRole, isAuthenticated } from "../utils/auth.utils";
import Swal from "sweetalert2";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
	const location = useLocation();
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		const checkAuth = () => {
			// Check if user is authenticated
			if (!isAuthenticated()) {
				setIsChecking(false);
				return;
			}

			// Get current user from token
			const user = getCurrentUser();
			if (!user) {
				setIsChecking(false);
				return;
			}

			// Determine required role
			let requiredRoleForRoute: string | undefined = requiredRole;
			if (!requiredRoleForRoute) {
				const roleFromPath = getRequiredRole(location.pathname);
				requiredRoleForRoute = roleFromPath || undefined;
			}

			// If no required role specified, allow access (for public routes)
			if (!requiredRoleForRoute) {
				setIsChecking(false);
				return;
			}

			// Check if user's role matches required role
			if (user.role === requiredRoleForRoute) {
				setIsChecking(false);
			} else {
				// User has wrong role - redirect to their correct route
				setIsChecking(false);

				Swal.fire({
					icon: "warning",
					title: "Access Denied",
					text: `You don't have permission to access this page. Redirecting to your dashboard...`,
					timer: 3000,
					showConfirmButton: false,
				});

				// Redirect will happen via Navigate component
			}
		};

		checkAuth();
	}, [location.pathname, requiredRole]);

	if (isChecking) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
			</div>
		);
	}

	if (!isAuthenticated()) {
		// Redirect to login page for the attempted route
		const loginPath = `${location.pathname}/login`;
		return <Navigate to={loginPath} replace state={{ from: location }} />;
	}

	const user = getCurrentUser();
	if (!user) {
		const loginPath = `${location.pathname}/login`;
		return <Navigate to={loginPath} replace state={{ from: location }} />;
	}

	// Check role authorization
	const requiredRoleForRoute = requiredRole || getRequiredRole(location.pathname) || undefined;
	if (requiredRoleForRoute && user.role !== requiredRoleForRoute) {
		// Redirect to user's correct route
		return <Navigate to={getRouteByRole(user.role)} replace />;
	}

	// User is authenticated and authorized
	return <>{children}</>;
};

export default ProtectedRoute;

