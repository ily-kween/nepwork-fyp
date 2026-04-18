import React, { useState, useEffect, useRef } from "react";
import { useAuth, useChat } from "../stores";
import default_avatar from "../assets/default_avatar.svg";
import capitalize from "../utils/capitalize";
import { FiSend, FiX, FiMessageSquare, FiLoader } from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";

const QuickChat = ({ recipientId, recipientName, onClose }) => {
    const { userData: currentUser, socket } = useAuth();
    const { chats, setChats, addMessage, addNewChat, setSelectedChat } = useChat();
    const [text, setText] = useState("");
    const [localMessages, setLocalMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Find existing chat or set up to create a new one
    useEffect(() => {
        const findChat = () => {
            const existingChat = chats.find(chat => 
                (chat.userOne._id === recipientId || chat.userTwo._id === recipientId)
            );
            
            if (existingChat) {
                setActiveChat(existingChat);
                setLocalMessages(existingChat.messages || []);
            } else {
                setActiveChat({
                    isNew: true,
                    userTwo: { _id: recipientId, name: { firstName: recipientName } }
                });
                setLocalMessages([]);
            }
        };

        if (chats.length === 0) {
            setChats().then(findChat);
        } else {
            findChat();
        }
    }, [recipientId, chats]);

    // Update local messages when global store updates
    useEffect(() => {
        if (activeChat?._id) {
            const currentChat = chats.find(c => c._id === activeChat._id);
            if (currentChat) {
                setLocalMessages(currentChat.messages || []);
            }
        }
    }, [chats, activeChat?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages]);

    const handleSendMessage = async () => {
        if (!text.trim() || sending) return;

        setSending(true);
        try {
            if (activeChat.isNew) {
                const response = await api.post("/chats/create-chat", {
                    receiverId: recipientId,
                    text: text,
                });
                const newChat = response.data.data;
                addNewChat(newChat);
                setActiveChat(newChat);
                setText("");
            } else {
                const response = await api.post(`/chats/${activeChat._id}/new-message`, {
                    message: text
                });
                const newMessage = response.data.data;
                addMessage(activeChat._id, newMessage);
                setText("");
            }
        } catch (error) {
            toast.error("Failed to send message");
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 md:w-96 h-[450px] bg-white shadow-2xl rounded-2xl flex flex-col z-50 border border-gray-100 animate-slide-up">
            {/* Header */}
            <div className="p-4 bg-primary text-white rounded-t-2xl flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {recipientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{capitalize(recipientName)}</h3>
                        <p className="text-[10px] opacity-80">Chatting...</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <FiX size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
                {localMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <FiMessageSquare size={40} className="mb-2" />
                        <p className="text-xs">Start a conversation...</p>
                    </div>
                ) : (
                    localMessages.map((msg, i) => (
                        <div 
                            key={msg._id || i} 
                            className={`flex ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                                msg.sender === currentUser._id 
                                ? "bg-primary text-white rounded-br-none shadow-sm" 
                                : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white rounded-b-2xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button 
                        disabled={sending}
                        onClick={handleSendMessage}
                        className={`p-2 bg-primary text-white rounded-xl transition-all ${sending ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                    >
                        {sending ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickChat;
