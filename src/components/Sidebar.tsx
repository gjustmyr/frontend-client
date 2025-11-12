import React from "react";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
}

const Sidebar = ({ isOpen, onClose, children, title = "Details" }: SidebarProps) => {
	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
				onClick={onClose}
			/>

			{/* Sidebar */}
			<div
				className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between z-10 shadow-md">
					<h2 className="text-xl poppins-semibold text-white">{title}</h2>
					<button
						onClick={onClose}
						className="text-white hover:text-gray-200 transition-colors bg-white bg-opacity-20 rounded-full p-1 hover:bg-opacity-30">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto h-[calc(100vh-80px)] p-6">{children}</div>
			</div>
		</>
	);
};

export default Sidebar;

