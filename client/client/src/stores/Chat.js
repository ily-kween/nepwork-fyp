import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useChat = create((set, get) => ({
    connections: [],
    connectionsLoading: true,
    chats: [],
    chatsLoading: true,
    selectedChat: null,

    setConnections: async () => {
        set({ connectionsLoading: true });
        try {
            const response = await api.get("/chats/get-connections");
            set({ connections: response.data.data, connectionsLoading: false });
        } catch (error) {
            toast.error("Failed to load connections");
            console.error(error);
        }
    },
    setChats: async () => {
        set({ chatsLoading: true });
        try {
            const response = await api.get("/chats");
            // Ensure all chats have messages arrays initialized
            const chatsWithMessages = response.data.data.map(chat => ({
                ...chat,
                messages: chat.messages || []
            }));
            set({ chats: chatsWithMessages, chatsLoading: false });
        } catch (error) {
            toast.error("Failed to load chats");
            console.error(error);
        }
    },
    addNewChat: (chat) => {
        const { chats } = get();
        // Ensure messages array exists
        const chatWithMessages = {
            ...chat,
            messages: chat.messages || []
        };
        const existingChatIndex = chats.findIndex(c => c._id === chat._id);
        
        if (existingChatIndex !== -1) {
            const updatedChats = [...chats];
            updatedChats[existingChatIndex] = chatWithMessages;
            set({ chats: updatedChats });
        } else {
            set({ chats: [chatWithMessages, ...chats] });
        }
    },
    removeChat: (chatId) => {
        const { chats, selectedChat } = get();
        const newChats = chats.filter((chat) => chat._id !== chatId);
        set({ chats: newChats });
        if (selectedChat._id === chatId) {
            set({ selectedChat: null });
        }
    },
    addMessage: (chatId, message) => {
        const { chats, selectedChat } = get();
        const updatedChats = chats.map((chat) => {
            if (chat._id === chatId) {
                const messages = chat.messages || [];
                // Check if message already exists to prevent duplicates
                if (messages.some(m => m._id === message._id)) return chat;
                return {
                    ...chat,
                    messages: [...messages, message],
                    lastMessage: message
                };
            }
            return chat;
        });
        set({ chats: updatedChats });
        
        // Also update selectedChat if this is the current chat
        if (selectedChat && selectedChat._id === chatId) {
            const messages = selectedChat.messages || [];
            // Check if message already exists to prevent duplicates
            if (!messages.some(m => m._id === message._id)) {
                set({
                    selectedChat: {
                        ...selectedChat,
                        messages: [...messages, message],
                        lastMessage: message
                    }
                });
            }
        }
    },
    setSelectedChat: (chat) => {
        set({ selectedChat: chat });
    },
    setUserOnline: (userId) => {
        const { connections, chats } = get();
        const updatedConnections = connections.map((connection) =>
            connection.userId._id === userId
                ? {
                      ...connection,
                      userId: {
                          ...connection.userId,
                          online: true,
                          lastSeen: null,
                      },
                  }
                : connection,
        );

        const updatedChats = chats.map((chat) =>
            chat.userOne._id === userId
                ? {
                      ...chat,
                      userOne: {
                          ...chat.userOne,
                          online: true,
                          lastSeen: null,
                      },
                  }
                : chat.userTwo._id === userId
                  ? {
                        ...chat,
                        userTwo: {
                            ...chat.userTwo,
                            online: true,
                            lastSeen: null,
                        },
                    }
                  : chat,
        );
        set({ connections: updatedConnections, chats: updatedChats });
    },
    setUserOffline: (userId, lastSeen) => {
        const { connections, chats } = get();
        const updatedConnections = connections.map((connection) =>
            connection.userId._id === userId
                ? {
                      ...connection,
                      userId: {
                          ...connection.userId,
                          online: false,
                          lastSeen: lastSeen,
                      },
                  }
                : connection,
        );

        const updatedChats = chats.map((chat) =>
            chat.userOne._id === userId
                ? {
                      ...chat,
                      userOne: {
                          ...chat.userOne,
                          online: false,
                          lastSeen: lastSeen,
                      },
                  }
                : chat.userTwo._id === userId
                  ? {
                        ...chat,
                        userTwo: {
                            ...chat.userTwo,
                            online: false,
                            lastSeen: lastSeen,
                        },
                    }
                  : chat,
        );

        set({ connections: updatedConnections, chats: updatedChats });
    },
}));
