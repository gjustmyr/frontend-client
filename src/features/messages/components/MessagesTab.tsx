import { useState, useEffect, useRef } from "react";
import { getConversations, getMessages, getChatPartners, connectSocket, sendMessage, markMessagesAsRead, type Conversation, type Message, type ChatPartner } from "../../../services/message.service";
import { getCurrentUser } from "../../../utils/auth.utils";
import { FiSend, FiCheck, FiCheckCircle, FiUserPlus, FiUsers, FiSearch } from "react-icons/fi";
import Swal from "sweetalert2";

const MessagesTab = () => {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
	const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [messageText, setMessageText] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [showAvailablePartners, setShowAvailablePartners] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const selectedConversationRef = useRef<number | null>(null);
	const currentUser = getCurrentUser();

	// Update ref when selectedConversation changes
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
	}, [selectedConversation]);

	// Fetch conversations function
	const fetchConversations = async () => {
		try {
			const data = await getConversations();
			setConversations(data);
			setLoading(false);
		} catch (error: any) {
			console.error("Error fetching conversations:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load conversations",
			});
			setLoading(false);
		}
	};

	// Fetch available chat partners
	const fetchChatPartners = async () => {
		try {
			const data = await getChatPartners();
			setChatPartners(data);
		} catch (error: any) {
			console.error("Error fetching chat partners:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load chat partners",
			});
		}
	};

	// Fetch messages function
	const fetchMessages = async (partnerId: number) => {
		try {
			const data = await getMessages(partnerId);
			setMessages(data);
			// Mark messages as read
			markMessagesAsRead(partnerId);
		} catch (error: any) {
			console.error("Error fetching messages:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to load messages",
			});
		}
	};

	useEffect(() => {
		// Connect to Socket.IO
		const socket = connectSocket();

		// Set up event listeners
		socket.on("connect", () => {
			console.log("Connected to Socket.IO");
		});

		socket.on("new_message", (message: Message) => {
			// Update conversations list first
			fetchConversations();
			
			// If this message is for the current conversation, add it
			const currentSelected = selectedConversationRef.current;
			if (currentSelected && (message.sender_id === currentSelected || message.receiver_id === currentSelected)) {
				setMessages((prev) => {
					// Check if message already exists
					const exists = prev.find((m) => m.message_id === message.message_id);
					if (exists) return prev;
					return [...prev, message];
				});
				// Mark as read if it's for the current user
				if (message.receiver_id === currentUser?.user_id) {
					markMessagesAsRead(message.sender_id);
				}
			}
		});

		socket.on("message_sent", (message: Message) => {
			// If this message is for the current conversation, add it
			const currentSelected = selectedConversationRef.current;
			if (currentSelected && (message.sender_id === currentSelected || message.receiver_id === currentSelected)) {
				setMessages((prev) => {
					// Check if message already exists
					const exists = prev.find((m) => m.message_id === message.message_id);
					if (exists) return prev;
					return [...prev, message];
				});
			}
			setSending(false);
			setMessageText("");
		});

		socket.on("messages_read", (data: { reader_id: number }) => {
			// Update read status for messages in current conversation
			setMessages((prev) =>
				prev.map((msg) =>
					msg.sender_id === currentUser?.user_id && msg.receiver_id === data.reader_id
						? { ...msg, is_read: true, read_at: new Date().toISOString() }
						: msg
				)
			);
		});

		socket.on("error", (error: { message: string }) => {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "An error occurred",
			});
			setSending(false);
		});

		socket.on("disconnect", () => {
			console.log("Disconnected from Socket.IO");
		});

		// Fetch conversations and chat partners on mount
		fetchConversations();
		fetchChatPartners();

		// Cleanup on unmount
		return () => {
			socket.off("new_message");
			socket.off("message_sent");
			socket.off("messages_read");
			socket.off("error");
			socket.off("disconnect");
			// Don't disconnect socket on unmount, keep it connected
		};
	}, []);

	useEffect(() => {
		// Scroll to bottom when messages change
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	useEffect(() => {
		// Fetch messages when conversation is selected
		if (selectedConversation) {
			fetchMessages(selectedConversation);
		} else {
			setMessages([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedConversation]);

	const handleSendMessage = async () => {
		if (!selectedConversation || !messageText.trim() || sending) {
			return;
		}

		setSending(true);
		try {
			sendMessage(selectedConversation, messageText.trim());
			// Refresh conversations after sending first message to show new conversation
			setTimeout(() => {
				fetchConversations();
			}, 500);
		} catch (error: any) {
			console.error("Error sending message:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.message || "Failed to send message",
			});
			setSending(false);
		}
	};

	// Handle starting a new conversation with a partner
	const handleStartConversation = (partnerId: number) => {
		setSelectedConversation(partnerId);
		setShowAvailablePartners(false);
		// Fetch messages for this partner (may be empty if first message)
		fetchMessages(partnerId);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "Just now";
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString();
	};

	const selectedConversationData = conversations.find((c) => c.partner_id === selectedConversation);
	const selectedPartnerData = chatPartners.find((p) => p.user_id === selectedConversation);

	// Get partners that don't have existing conversations
	const availablePartners = chatPartners.filter(
		(partner) => !conversations.some((conv) => conv.partner_id === partner.user_id)
	);

	// Filter conversations by search term
	const filteredConversations = conversations.filter((conversation) =>
		conversation.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Filter available partners by search term
	const filteredAvailablePartners = availablePartners.filter((partner) =>
		partner.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="text-gray-500 poppins-regular">Loading conversations...</div>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-300px)] border border-gray-200 rounded-lg overflow-hidden">
			{/* Conversations List */}
			<div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto flex flex-col">
				<div className="p-4 border-b border-gray-200 bg-white">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg poppins-semibold text-gray-800">Conversations</h2>
						<button
							onClick={() => setShowAvailablePartners(!showAvailablePartners)}
							className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
							title={showAvailablePartners ? "Show Conversations" : "Start New Conversation"}>
							{showAvailablePartners ? <FiUsers size={20} /> : <FiUserPlus size={20} />}
						</button>
					</div>
					{/* Search Input */}
					<div className="relative">
						<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search by name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent poppins-regular text-sm"
						/>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto divide-y divide-gray-200">
					{showAvailablePartners ? (
						<>
							<div className="p-3 bg-blue-50 border-b border-blue-200">
								<p className="text-sm poppins-medium text-blue-800">Start New Conversation</p>
								<p className="text-xs poppins-regular text-blue-600 mt-1">Select someone to message</p>
							</div>
							{filteredAvailablePartners.length === 0 ? (
								<div className="p-4 text-center text-gray-500 poppins-regular">
									{searchTerm ? `No partners found matching "${searchTerm}"` : "All available partners already have conversations"}
								</div>
							) : (
								filteredAvailablePartners.map((partner) => (
									<button
										key={partner.user_id}
										onClick={() => handleStartConversation(partner.user_id)}
										className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
											selectedConversation === partner.user_id ? "bg-blue-50 border-l-4 border-blue-500" : ""
										}`}>
										<div className="flex items-center justify-between mb-1">
											<h3 className="text-sm poppins-semibold text-gray-800">{partner.name}</h3>
											<span className="text-xs text-blue-600 poppins-medium">New</span>
										</div>
										<p className="text-xs text-gray-400 poppins-regular mt-1 capitalize">
											{partner.role.replace("-", " ")}
										</p>
									</button>
								))
							)}
						</>
					) : (
						<>
							{filteredConversations.length === 0 ? (
								<div className="p-4 text-center text-gray-500 poppins-regular">
									{searchTerm ? (
										<p>No conversations found matching "{searchTerm}"</p>
									) : (
										<>
											<p>No conversations yet</p>
											<button
												onClick={() => setShowAvailablePartners(true)}
												className="mt-2 text-sm text-blue-600 hover:text-blue-800 poppins-medium">
												Start a conversation
											</button>
										</>
									)}
								</div>
							) : (
								filteredConversations.map((conversation) => (
									<button
										key={conversation.partner_id}
										onClick={() => handleStartConversation(conversation.partner_id)}
										className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
											selectedConversation === conversation.partner_id ? "bg-blue-50 border-l-4 border-blue-500" : ""
										}`}>
										<div className="flex items-center justify-between mb-1">
											<h3 className="text-sm poppins-semibold text-gray-800">{conversation.partner_name}</h3>
											{conversation.unread_count > 0 && (
												<span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full poppins-medium">
													{conversation.unread_count}
												</span>
											)}
										</div>
										{conversation.last_message && (
											<>
												<p className="text-xs text-gray-600 poppins-regular truncate">
													{conversation.last_message.is_sender ? "You: " : ""}
													{conversation.last_message.message}
												</p>
												<p className="text-xs text-gray-400 poppins-regular mt-1">
													{formatTime(conversation.last_message.created_at)}
												</p>
											</>
										)}
										<p className="text-xs text-gray-400 poppins-regular mt-1 capitalize">
											{conversation.partner_role.replace("-", " ")}
										</p>
									</button>
								))
							)}
						</>
					)}
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col">
				{selectedConversation ? (
					<>
						{/* Chat Header */}
						<div className="p-4 border-b border-gray-200 bg-white">
							<h3 className="text-lg poppins-semibold text-gray-800">
								{selectedConversationData?.partner_name || selectedPartnerData?.name || "Unknown"}
							</h3>
							<p className="text-xs text-gray-500 poppins-regular capitalize">
								{(selectedConversationData?.partner_role || selectedPartnerData?.role || "").replace("-", " ")}
							</p>
						</div>

						{/* Messages */}
						<div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
							{messages.length === 0 ? (
								<div className="text-center text-gray-500 poppins-regular py-10">
									No messages yet. Start a conversation!
								</div>
							) : (
								messages.map((message) => {
									const isSender = message.sender_id === currentUser?.user_id;
									return (
										<div
											key={message.message_id}
											className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
											<div
												className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
													isSender
														? "bg-blue-500 text-white"
														: "bg-white text-gray-800 border border-gray-200"
												}`}>
												<p className={`text-sm poppins-regular ${isSender ? "text-white" : "text-gray-800"}`}>
													{message.message}
												</p>
												<div className="flex items-center justify-end gap-1 mt-1">
													<span className={`text-xs ${isSender ? "text-blue-100" : "text-gray-400"}`}>
														{formatTime(message.createdAt)}
													</span>
													{isSender && (
														<span className="text-xs">
															{message.is_read ? (
																<FiCheckCircle className="text-blue-200" size={14} />
															) : (
																<FiCheck className="text-blue-200" size={14} />
															)}
														</span>
													)}
												</div>
											</div>
										</div>
									);
								})
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Message Input */}
						<div className="p-4 border-t border-gray-200 bg-white">
							<div className="flex gap-2">
								<textarea
									value={messageText}
									onChange={(e) => setMessageText(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Type a message..."
									className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 poppins-regular"
									rows={2}
									disabled={sending}
								/>
								<button
									onClick={handleSendMessage}
									disabled={!messageText.trim() || sending}
									className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors poppins-medium flex items-center gap-2">
									<FiSend size={18} />
									Send
								</button>
							</div>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center text-gray-500 poppins-regular">
						Select a conversation to start chatting
					</div>
				)}
			</div>
		</div>
	);
};

export default MessagesTab;

