import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";
import { getOJTRequirements } from "../../../services/ojt-requirement.service";

interface RequirementTemplate {
	ojt_requirement_id: number;
	requirement_name: string;
	type: "pre-ojt" | "post-ojt";
	status: "active" | "inactive" | "expired";
	document_url?: string;
	description?: string;
	updatedAt?: string;
}

const typeLabels: Record<RequirementTemplate["type"], string> = {
	"pre-ojt": "Pre-OJT",
	"post-ojt": "Post-OJT",
};

const statusStyles: Record<RequirementTemplate["status"], string> = {
	active: "bg-green-100 text-green-700",
	inactive: "bg-red-100 text-red-700",
	expired: "bg-yellow-100 text-yellow-700",
};

const RequirementTemplatesTab = () => {
	const [templates, setTemplates] = useState<RequirementTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<"all" | RequirementTemplate["type"]>("all");

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				setLoading(true);
				const data = await getOJTRequirements();
				setTemplates(data as RequirementTemplate[]);
			} catch (error: any) {
				console.error("Failed to load OJT requirement templates", error);
				Swal.fire({
					icon: "error",
					title: "Error",
					text: error.message || "Unable to load templates. Please try again later.",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchTemplates();
	}, []);

	const filteredTemplates = useMemo(() => {
		return templates.filter((template) => {
			const matchesType = filterType === "all" || template.type === filterType;
			const matchesSearch = template.requirement_name
				.toLowerCase()
				.includes(searchTerm.trim().toLowerCase());
			return matchesType && matchesSearch;
		});
	}, [templates, filterType, searchTerm]);

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div>
					<h2 className="text-xl poppins-semibold text-gray-800">OJT Requirement Templates</h2>
					<p className="text-gray-600 poppins-regular mt-1">
						Download the latest Pre-OJT and Post-OJT templates provided by your coordinators.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					<div className="relative flex-1 sm:flex-none">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search requirements..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent poppins-regular text-sm"
						/>
					</div>

					<select
						value={filterType}
						onChange={(event) => setFilterType(event.target.value as RequirementTemplate["type"] | "all")}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent poppins-regular text-sm">
						<option value="all">All Types</option>
						<option value="pre-ojt">Pre-OJT</option>
						<option value="post-ojt">Post-OJT</option>
					</select>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-12 text-gray-500 poppins-regular">
					Loading templates...
				</div>
			) : filteredTemplates.length === 0 ? (
				<div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
					<FiFileText size={40} className="mx-auto text-gray-400 mb-3" />
					<h3 className="text-lg poppins-semibold text-gray-700 mb-1">No Templates Found</h3>
					<p className="text-gray-500 poppins-regular">
						{templates.length === 0
							? "Your coordinators have not published any OJT templates yet."
							: "Try adjusting your search or filter to find a specific template."}
					</p>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{filteredTemplates.map((template) => (
						<div key={template.ojt_requirement_id} className="border border-gray-200 rounded-lg shadow-sm p-5 bg-white flex flex-col h-full">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-lg poppins-semibold text-gray-800">{template.requirement_name}</h3>
									<p className="text-sm text-gray-500 poppins-regular mt-1">{typeLabels[template.type]}</p>
								</div>
								<span className={`px-3 py-1 rounded-full text-xs poppins-semibold ${statusStyles[template.status]}`}>
									{template.status.charAt(0).toUpperCase() + template.status.slice(1)}
								</span>
							</div>

							{template.description && (
								<p className="mt-3 text-sm text-gray-600 poppins-regular line-clamp-3">{template.description}</p>
							)}

							<div className="mt-4 flex items-center justify-between">
								{template.updatedAt && (
									<p className="text-xs text-gray-400 poppins-regular">
										Updated {new Date(template.updatedAt).toLocaleDateString()}
									</p>
								)}

								{template.document_url ? (
									<a
										href={template.document_url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors poppins-medium">
										<FiDownload size={16} />
										Download
									</a>
								) : (
									<span className="text-xs text-red-500 poppins-medium">Document not available</span>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default RequirementTemplatesTab;
