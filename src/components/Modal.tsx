import React from "react";

interface ModalProps {
	children: React.ReactNode;
	onClose: () => void;
	size?: "sm" | "md" | "lg" | "xl";
}

const Modal = ({ children, onClose, size = "md" }: ModalProps) => {
	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-2xl",
		lg: "max-w-4xl",
		xl: "max-w-6xl",
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
			onClick={(e) => {
				// Close modal if clicking on backdrop
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}>
			<div
				className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto relative`}
				onClick={(e) => e.stopPropagation()}>
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors">
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
				{/* Modal content */}
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
};

export default Modal;

