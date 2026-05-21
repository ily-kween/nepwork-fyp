import { useState, useEffect, useRef } from "react";
import { format, differenceInHours, parseISO } from "date-fns";
import { useNavigate } from "react-router";
import { useAuth, useChat, usePostedJobs, useFreelancerJobs } from "../stores";
import default_avatar from "../assets/default_avatar.svg";
import capitalize from "../utils/capitalize.js";
import { Button, ConfirmModal } from "../components";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import {
    FiPlus,
    FiMessageSquare,
    FiArrowLeft,
    FiSearch,
    FiX,
    FiSend,
    FiTrash2,
    FiChevronDown,
} from "react-icons/fi";

export default function Inbox() {
    const navigate = useNavigate();
    const bottomRef = useRef(null);
    const { socket, userData: currentUser } = useAuth();
    const {
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        connections: users,
        setConnections,
        addMessage,
        addNewChat,
        removeChat,
        setUserOffline,
        setUserOnline,
    } = useChat();
    const { jobs: postedJobs, fetchPostedJobs } = usePostedJobs();
    const { jobs: freelancerJobs, fetchFreelancerJobs } = useFreelancerJobs();
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [text, setText] = useState("");
    const [deleteChatModal, setDeleteChatModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteErr, setDeleteErr] = useState(null);

    const formatLastSeen = (date) => {
        if (!date) return "Never seen";
        try {
            const parsedDate = date instanceof Date ? date : parseISO(date);
            if (isNaN(parsedDate)) return "Invalid date";
            const now = new Date();
            const hoursDifference = differenceInHours(now, parsedDate);
            return hoursDifference < 24
                ? format(parsedDate, "hh:mm a")
                : format(parsedDate, "MM/dd/yyyy");
        } catch (error) {
            console.error("Error formatting last seen:", error);
            return "--";
        }
    };

    const handleAddNewChat = (user) => {
        // support both connection wrapper { userId: {...} } and plain user objects
        const target = user.userId ? user.userId : user;
        const chatExistsIndex = chats.findIndex((chat) =>
            [chat.userOne._id, chat.userTwo._id].includes(target._id),
        );

        if (chatExistsIndex >= 0) {
            setSelectedChat(chats[chatExistsIndex]);
        } else {
            setSelectedChat({
                createdAt: null,
                updatedAt: null,
                messages: [],
                unreadOne: 0,
                unreadTwo: 0,
                userOne: currentUser,
                userTwo: target,
            });
        }
        setShowNewChatModal(false);
    };

    const handleStartChat = async (chat, text) => {
        try {
            const response = await api.post("/chats/create-chat", {
                receiverId: chat?.userTwo?._id,
                text,
            });
            const newChat = response.data.data;
            setText("");
            addNewChat(newChat);
            setSelectedChat(newChat);
        } catch (error) {
            toast.error("Failed to start chat");
            console.error(error);
        }
    };

    const sendMessage = async () => {
        if (!text.trim()) return;
        if (!selectedChat?.createdAt) {
            handleStartChat(selectedChat, text);
            return;
        }

        try {
            const response = await api.post(
                `/chats/${selectedChat._id}/new-message`,
                { message: text },
            );
            const newMessage = response.data.data;
            addMessage(selectedChat._id, newMessage);
            setText("");
        } catch (error) {
            toast.error("Failed to send message!");
            console.error(error);
        }
    };

    const handleNewMessage = (data) => {
        addMessage(data.chatId, data.newMessage);
    };

    const handleNewChat = (newChat) => {
        addNewChat(newChat);
    };

    const handleUserOnline = ({ userId }) => {
        setUserOnline(userId);
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
        setUserOffline(userId, lastSeen);
    };

    const handleOnConfirmDelete = async () => {
        if (!selectedChat) return;

        setDeleting(true);
        try {
            const response = await api.delete(
                `/chats/delete/${selectedChat?._id}`,
            );
            removeChat(response.data.data._id);
            setDeleteChatModal(false);
            toast.success("Chat deleted");
        } catch (error) {
            setDeleteErr(error.response.data.message);
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const handleChatDelete = ({ chatId }) => {
        removeChat(chatId);
    };

    useEffect(() => {
        setChats();
        setConnections();

        if (currentUser?.role === "client") {
            fetchPostedJobs();
        } else if (currentUser?.role === "freelancer") {
            fetchFreelancerJobs();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("newMessage", handleNewMessage);
            socket.on("newChat", handleNewChat);
            socket.on("userOffline", handleUserOffline);
            socket.on("userOnline", handleUserOnline);
            socket.on("chatDelete", handleChatDelete);
            return () => {
                socket.off("newMessage", handleNewMessage);
                socket.off("newChat", handleNewChat);
                socket.off("userOffline", handleUserOffline);
                socket.off("userOnline", handleUserOnline);
                socket.off("chatDelete", handleChatDelete);
            };
        }
    }, [socket]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat?.messages?.length]);

    // Compute users the current user has worked with
    const workedSet = new Set();
    let workedUsers = [];
    if (currentUser?.role === "client") {
        (postedJobs || []).forEach(job => {
            if (job?.acceptedFreelancer?._id) {
                workedSet.add(job.acceptedFreelancer._id);
                workedUsers.push(job.acceptedFreelancer);
            }
        });
    } else if (currentUser?.role === "freelancer") {
        (freelancerJobs || []).forEach(job => {
            if (job?.postedBy?._id) {
                workedSet.add(job.postedBy._id);
                workedUsers.push(job.postedBy);
            }
        });
    }
    // dedupe by _id
    const seen = new Set();
    workedUsers = workedUsers.filter(u => {
        if (!u || !u._id) return false;
        if (seen.has(u._id)) return false;
        seen.add(u._id);
        return true;
    });

    return (
        <div className="flex bg-gray-50 w-full h-screen overflow-hidden">
            {/* Confirmation Modals */}
            {deleteChatModal && (
                <ConfirmModal
                    title="Delete Conversation?"
                    message="This will permanently delete the chat history for both participants."
                    isDelete={true}
                    setShowModalFn={setDeleteChatModal}
                    onConfirmFn={handleOnConfirmDelete}
                    loading={deleting}
                    err={deleteErr}
                />
            )}

            {/* Sidebar: Chat List */}
            <aside
                className={`flex-shrink-0 md:w-[380px] w-full h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${selectedChat ? "hidden md:flex" : "flex"}`}
            >
                {/* Sidebar Header */}
                <div className="p-6 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">💬 Messages</h1>
                        <button
                            onClick={() => setShowNewChatModal(true)}
                            className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <FiPlus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Connections: show users (worked-with) without searching */}
                <div className="px-3 pb-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{currentUser?.role === 'client' ? 'Freelancers you worked with' : 'Clients you worked with'}</h4>
                    <div className="space-y-2">
                        {workedUsers.length === 0 ? (
                            <div className="text-xs text-slate-400">No past collaborators yet</div>
                        ) : (
                            workedUsers.slice(0, 8).map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => handleAddNewChat(u)}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all text-left"
                                >
                                    <img src={u.avatar || default_avatar} className="w-9 h-9 rounded-lg object-cover" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{capitalize(u.name?.firstName)} {capitalize(u.name?.lastName)}</div>
                                        <div className="text-xs text-slate-400">{u.online ? 'Active now' : formatLastSeen(u.lastSeen)}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 py-4">
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                                <FiMessageSquare className="w-8 h-8 text-primary/40" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">No conversations yet</p>
                            <p className="text-xs text-slate-500 mt-2">Start a new chat to connect</p>
                        </div>
                    ) : (
                        chats
                            .filter(chat => {
                                const otherUser = chat.userOne._id === currentUser._id ? chat.userTwo : chat.userOne;
                                const fullName = `${otherUser.name.firstName} ${otherUser.name.lastName}`.toLowerCase();
                                return fullName.includes(searchQuery.toLowerCase());
                            })
                            .map((chat) => {
                                const otherUser = chat.userOne._id === currentUser._id ? chat.userTwo : chat.userOne;
                                const isActive = selectedChat?._id === chat._id;
                                
                                return (
                                    <button
                                        key={chat._id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                                            isActive 
                                                ? "bg-primary/10 border border-primary/20" 
                                                : "hover:bg-slate-50 border border-transparent"
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={otherUser?.avatar || default_avatar}
                                                className={`w-12 h-12 rounded-lg object-cover ring-2 ${isActive ? 'ring-primary/30' : 'ring-slate-200'} group-hover:scale-105 transition-transform duration-200`}
                                                alt=""
                                            />
                                            {otherUser?.online && (
                                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-primary' : 'text-slate-900'}`}>
                                                    {capitalize(otherUser?.name?.firstName)} {capitalize(otherUser?.name?.lastName)}
                                                </h3>
                                                {chat.updatedAt && (
                                                    <span className="text-[10px] font-medium text-slate-500">
                                                        {formatLastSeen(chat.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate ${isActive ? 'text-primary/70 font-medium' : 'text-slate-500'}`}>
                                                {chat.lastMessage?.text || (otherUser?.online ? "Active now" : "Offline")}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                    )}
                </div>
            </aside>

            {/* Chat Viewport */}
            <main className={`flex-1 flex flex-col bg-white h-full relative ${!selectedChat ? "hidden md:flex items-center justify-center bg-slate-50" : "flex"}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-20 flex-shrink-0 border-b border-slate-200 px-6 flex items-center justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <FiArrowLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                
                                <div className="relative group cursor-pointer" onClick={() => {
                                    const otherUser = selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne;
                                    if (otherUser?._id) {
                                        navigate(`/profile/${otherUser._id}`);
                                    } else {
                                        toast.error("User profile not available");
                                    }
                                }}>
                                    <img
                                        src={(selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.avatar || default_avatar}
                                        className="w-11 h-11 rounded-lg object-cover ring-2 ring-slate-200 group-hover:ring-primary/30 transition-all"
                                        alt=""
                                    />
                                    {(selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.online && (
                                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-slate-900 truncate">
                                        {capitalize((selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.name.firstName)}{" "}
                                        {capitalize((selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.name.lastName)}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${(selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.online ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                        <p className="text-xs font-medium text-slate-500">
                                            {(selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.isTyping ? "Typing..." : ((selectedChat.userOne._id === currentUser._id ? selectedChat.userTwo : selectedChat.userOne)?.online ? "Online" : "Offline")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedChat.createdAt && (
                                    <button
                                        onClick={() => setDeleteChatModal(true)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete Chat"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                    <FiX className="w-5 h-5" onClick={() => setSelectedChat(null)} />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar bg-gradient-to-b from-slate-50 to-white">
                            {selectedChat.messages?.map((message, index) => (
                                <MessageBubble
                                    key={message._id || index}
                                    message={message}
                                    isCurrentUser={message.sender === currentUser._id}
                                />
                            ))}
                            <div ref={bottomRef} className="h-4" />
                        </div>

                        {/* Footer: Input */}
                        <footer className="p-5 bg-white border-t border-slate-200">
                            <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    rows="1"
                                    className="flex-1 bg-transparent py-3 px-3 resize-none outline-none text-sm font-medium placeholder-slate-400 min-h-[44px] max-h-[100px]"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!text.trim()}
                                    className={`h-10 px-5 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 ${
                                        text.trim() 
                                            ? "bg-primary text-white hover:bg-primary/90 shadow-md" 
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }`}
                                >
                                    <FiSend className="w-4 h-4" />
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="text-center max-w-sm space-y-5">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                            <FiMessageSquare className="w-10 h-10 text-primary/50" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">📬 Your Inbox</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mt-2">Select a conversation to start messaging or create a new chat.</p>
                        </div>
                        <button 
                            onClick={() => setShowNewChatModal(true)}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md"
                        >
                            ✨ Start New Chat
                        </button>
                    </div>
                )}
            </main>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="p-8 border-b border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Message</h2>
                                <button
                                    onClick={() => setShowNewChatModal(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search connections..."
                                    className="w-full bg-gray-50 border-transparent border-2 border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[400px] custom-scrollbar p-4">
                            {(() => {
                                const workedSet = new Set();
                                if (currentUser?.role === "client") {
                                    (postedJobs || []).forEach(job => {
                                        if (job?.acceptedFreelancer?._id) workedSet.add(job.acceptedFreelancer._id);
                                    });
                                } else if (currentUser?.role === "freelancer") {
                                    (freelancerJobs || []).forEach(job => {
                                        if (job?.postedBy?._id) workedSet.add(job.postedBy._id);
                                    });
                                }

                                const filtered = (users || [])
                                    .map(u => ({
                                        ...u,
                                        _searchName: `${u.userId.name.firstName} ${u.userId.name.lastName}`.toLowerCase(),
                                    }))
                                    .filter(u => u._searchName.includes(searchQuery.toLowerCase()) && u.userId._id !== currentUser._id);

                                if (filtered.length === 0) {
                                    return (
                                        <div className="py-12 text-center opacity-40">
                                            <p className="text-sm font-bold uppercase tracking-widest">No connections found</p>
                                        </div>
                                    );
                                }

                                return filtered.map((user) => {
                                    const worked = workedSet.has(user.userId._id);
                                    return (
                                        <button
                                            key={user._id}
                                            onClick={() => {
                                                if (!worked) {
                                                    toast.error("You can only start a chat with users you've worked with");
                                                    return;
                                                }
                                                handleAddNewChat(user);
                                            }}
                                            disabled={!worked}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${!worked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={user.userId.avatar || default_avatar}
                                                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                                                    alt=""
                                                />
                                                {user.userId.online && (
                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-4 border-white rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-sm text-gray-900 truncate">
                                                    {capitalize(user.userId.name.firstName)} {capitalize(user.userId.name.lastName)}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {user.userId.online ? "Active Now" : `Last seen ${formatLastSeen(user.userId.lastSeen)}`}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MessageBubble({ message, isCurrentUser }) {
    const timestamp = format(new Date(message.timestamp), "hh:mm a");

    return (
        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                        className={`px-4 py-2.5 rounded-2xl transition-all ${
                            isCurrentUser
                                ? "bg-primary text-white rounded-br-none shadow-sm hover:shadow-md"
                                : "bg-slate-100 text-slate-900 rounded-bl-none shadow-sm hover:shadow-md"
                        }`}
                    >
                        <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    </div>
                    <span className="mt-1 text-xs font-medium text-slate-500">
                        {timestamp}
                    </span>
                </div>
            </div>
        </div>
    );
}
