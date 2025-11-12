import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginScreen from "./auth/LoginScreen";
import OJTHead from "./features/OJTHead";
import OJTCoordinator from "./features/OJTCoordinator";
import CompanyRepresentative from "./features/CompanyRepresentative";
import StudentTrainee from "./features/StudentTrainee";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<NotFound />} />
				<Route path="/:path/login" element={<LoginScreen />} />
				<Route
					path="/ojt-head"
					element={
						<ProtectedRoute requiredRole="ojt-head">
							<OJTHead />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/ojt-coordinator"
					element={
						<ProtectedRoute requiredRole="ojt-coordinator">
							<OJTCoordinator />
						</ProtectedRoute>
					}
				/>
			<Route
				path="/company-representative"
				element={
					<ProtectedRoute requiredRole="employer">
						<CompanyRepresentative />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/student-trainee"
				element={
					<ProtectedRoute requiredRole="student-trainee">
						<StudentTrainee />
					</ProtectedRoute>
				}
			/>
			{/* 404 Not Found - Catch all unmatched routes */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	</BrowserRouter>
);
}

export default App;
