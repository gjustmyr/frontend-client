import { io, Socket } from "socket.io-client";

const API_BASE = "http://localhost:3000/api/messages";

const request = async (url: string, options: RequestInit = {}) => {
	const headers: any = {
		Authorization: `Bearer ${localStorage.getItem("authToken")}`,
	};

	if (options.body && !(options.body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	try {
		const res = await fetch(url, { headers, ...options });
		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			throw new Error(data.message || "API request failed");
		}

		return data;
	} catch (err: any) {
		throw new Error(err.message || "Network error");
	}
};

export interface Conversation {
	partner_id: number;
	partner_name: string;
	partner_role: string;
	last_message: {
		message: string;
		created_at: string;
		is_sender: boolean;
	} | null;
	unread_count: number;
}

export interface Message {
	message_id: number;
	sender_id: number;
	receiver_id: number;
	message: string;
	is_read: boolean;
	read_at: string | null;
	createdAt: string;
	updatedAt: string;
	sender?: {
		user_id: number;
		email: string;
	};
	receiver?: {
		user_id: number;
		email: string;
	};
}

export interface ChatPartner {
	user_id: number;
	name: string;
	role: string;
}

// Get all conversations
export const getConversations = async (): Promise<Conversation[]> => {
	const data = await request(`${API_BASE}/conversations`);
	return data.data || [];
};

// Get messages for a specific conversation
export const getMessages = async (partnerId: number): Promise<Message[]> => {
	const data = await request(`${API_BASE}/messages/${partnerId}`);
	return data.data || [];
};

// Get available chat partners
export const getChatPartners = async (): Promise<ChatPartner[]> => {
	const data = await request(`${API_BASE}/partners`);
	return data.data || [];
};

// Socket.IO client setup
let socket: Socket | null = null;

export const connectSocket = (): Socket => {
	if (socket && socket.connected) {
		return socket;
	}

	const token = localStorage.getItem("authToken");
	if (!token) {
		throw new Error("No authentication token found");
	}

	socket = io("http://localhost:3000", {
		auth: {
			token: token,
		},
		transports: ["websocket", "polling"],
	});

	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

export const getSocket = (): Socket | null => {
	return socket;
};

// Send message via Socket.IO
export const sendMessage = (receiverId: number, message: string) => {
	if (!socket || !socket.connected) {
		throw new Error("Socket not connected");
	}

	socket.emit("send_message", {
		receiver_id: receiverId,
		message: message,
	});
};

// Mark messages as read via Socket.IO
export const markMessagesAsRead = (partnerId: number) => {
	if (!socket || !socket.connected) {
		return;
	}

	socket.emit("mark_read", {
		partner_id: partnerId,
	});
};

