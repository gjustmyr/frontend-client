import { useParams, useNavigate } from "react-router-dom";
import HeaderLayout from "../layouts/HeaderLayout";
import { useEffect, useState } from "react";
import { getRole } from "../utils/role.utils";
import { isAuthenticated, getCurrentUser, getRouteByRole } from "../utils/auth.utils";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";

function LoginScreen() {
	const { path } = useParams(); // e.g. "ojt-head"
	const navigate = useNavigate();

	const [title, setTitle] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [loginCredentials, setLoginCredentials] = useState({
		email: "",
		password: "",
	});

	useEffect(() => {
		setTitle(getRole(path || ""));
	}, [path]);

	// Check if user is already authenticated and redirect to their dashboard
	useEffect(() => {
		const checkAuthAndRedirect = () => {
			if (isAuthenticated()) {
				const user = getCurrentUser();
				if (user && user.role) {
					const dashboardRoute = getRouteByRole(user.role);
					// Only redirect if we have a valid route
					if (dashboardRoute && dashboardRoute !== "/") {
						navigate(dashboardRoute, { replace: true });
					}
				}
			}
		};

		checkAuthAndRedirect();
	}, [navigate]);

	const loginMutation = useMutation({
		mutationFn: async (payload: {
			email: string;
			password: string;
			role: string;
		}) => {
			const res = await fetch("http://ec2-47-128-242-59.ap-southeast-1.compute.amazonaws.com:3000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Login failed");
			return data;
		},
		onSuccess: (data) => {
			const { token, role, path } = data.data;

			// 💾 Save token
			localStorage.setItem("authToken", token);

			// 🎉 Show success alert
			Swal.fire({
				icon: "success",
				title: "Login Successful!",
				text: `Welcome ${getRole(role)}.`,
				showConfirmButton: false,
				timer: 2000,
			});

			// 🔀 Redirect to role-based dashboard
			setTimeout(() => {
				navigate(path);
			}, 2000);
		},
		onError: (error: any) => {
			Swal.fire({
				icon: "error",
				title: "Login Failed",
				text: error.message || "Invalid email or password.",
			});
		},
	});

	// 🧾 Handle form submit
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!path) {
			Swal.fire({
				icon: "error",
				title: "Missing Role",
				text: "Invalid login route.",
			});
			return;
		}

		loginMutation.mutate({
			email: loginCredentials.email,
			password: loginCredentials.password,
			role: path,
		});
	};

	return (
		<section className="login-screen bg-gray-100 min-h-screen">
			<div className="w-4/5 mx-auto bg-white shadow-md">
				<HeaderLayout bannerName={path || "default"} />

				<div className="py-2 flex justify-center border border-gray-200 bg-gray-100">
					<h1 className="poppins-medium">Login as {title}</h1>
				</div>

				<div className="p-4">
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4 w-1/2 mx-auto border border-gray-700 p-10 bg-white shadow-sm">
						<div className="input-group">
							<label htmlFor="email" className="block mb-1 poppins-medium">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={loginCredentials.email}
								onChange={(e) =>
									setLoginCredentials({
										...loginCredentials,
										email: e.target.value,
									})
								}
								className="w-full p-2 border border-gray-700 poppins-regular rounded-xs outline-none"
								required
							/>
						</div>

						<div className="input-group">
							<label htmlFor="password" className="block mb-1 poppins-medium">
								Password
							</label>
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								value={loginCredentials.password}
								onChange={(e) =>
									setLoginCredentials({
										...loginCredentials,
										password: e.target.value,
									})
								}
								className="w-full p-2 border border-gray-700 poppins-regular rounded-xs outline-none"
								required
							/>
							<div className="mt-2 flex items-center cursor-pointer">
								<input
									type="checkbox"
									id="show-password"
									checked={showPassword}
									onChange={(e) => setShowPassword(e.target.checked)}
									className="cursor-pointer"
								/>
								<label
									htmlFor="show-password"
									className="ml-2 poppins-regular text-sm cursor-pointer">
									Show Password
								</label>
							</div>
						</div>

						<button
							type="submit"
							disabled={loginMutation.isPending}
							className="bg-green-600 text-white py-2 px-4 rounded-xs poppins-medium hover:bg-green-700 transition duration-300 cursor-pointer disabled:opacity-50">
							{loginMutation.isPending ? "Logging in..." : "Login"}
						</button>

						<div className="flex justify-between">
							<a
								href="#"
								className="text-sm poppins-regular text-blue-600 hover:underline">
								Forgot Password?
							</a>
							<a
								href="#"
								className="text-sm poppins-regular text-blue-600 hover:underline">
								Contact Us
							</a>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default LoginScreen;
