import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import HeaderLayout from "../layouts/HeaderLayout";
import { registerAlumni } from "../services/alumni.service";

const AlumniRegister = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		first_name: "",
		middle_name: "",
		last_name: "",
		email: "",
		password: "",
		confirm_password: "",
		contact_number: "",
		current_position: "",
		company_name: "",
		linked_in_url: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirm_password) {
			Swal.fire({
				icon: "error",
				title: "Password mismatch",
				text: "Passwords do not match.",
			});
			return;
		}

		try {
			setLoading(true);
			await registerAlumni({
				first_name: formData.first_name,
				middle_name: formData.middle_name || undefined,
				last_name: formData.last_name,
				email: formData.email,
				password: formData.password,
				contact_number: formData.contact_number || undefined,
				current_position: formData.current_position || undefined,
				company_name: formData.company_name || undefined,
				linked_in_url: formData.linked_in_url || undefined,
			});

			Swal.fire({
				icon: "success",
				title: "Registration Submitted",
				text: "Your account will be validated by the Job Placement Office. You will be notified once it is activated.",
			}).then(() => {
				navigate("/alumni/login");
			});
		} catch (error: any) {
			console.error(error);
			Swal.fire({
				icon: "error",
				title: "Registration Failed",
				text: error.message || "Unable to register at this time.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="min-h-screen bg-gray-100">
			<HeaderLayout bannerName={"alumni-register"} />
			<div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
				<h1 className="text-2xl poppins-semibold text-gray-800 mb-6 text-center">
					Alumni Registration
				</h1>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium mb-1">First Name *</label>
							<input
								name="first_name"
								value={formData.first_name}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">Middle Name</label>
							<input
								name="middle_name"
								value={formData.middle_name}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">Last Name *</label>
							<input
								name="last_name"
								value={formData.last_name}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">Email *</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium mb-1">Password *</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">Confirm Password *</label>
							<input
								type="password"
								name="confirm_password"
								value={formData.confirm_password}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium mb-1">Contact Number</label>
							<input
								name="contact_number"
								value={formData.contact_number}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">Current Position</label>
							<input
								name="current_position"
								value={formData.current_position}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm poppins-medium mb-1">Company</label>
							<input
								name="company_name"
								value={formData.company_name}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label className="block text-sm poppins-medium mb-1">LinkedIn URL</label>
							<input
								name="linked_in_url"
								value={formData.linked_in_url}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="https://www.linkedin.com/in/username"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<button
							type="button"
							className="text-sm text-green-600 hover:underline"
							onClick={() => navigate("/alumni/login")}>
							Back to Alumni Login
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-3 bg-green-500 text-white rounded-lg poppins-medium hover:bg-green-600 transition disabled:bg-gray-300">
							{loading ? "Submitting..." : "Register"}
						</button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default AlumniRegister;

