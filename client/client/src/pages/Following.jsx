import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import api from "../utils/api";
import { useAuth } from "../stores";
import { ConnectionUserList, Loader } from "../components";

function Following() {
    const { userId } = useParams();
    const { userData: currentUserData, isLoggedIn } = useAuth;
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSetFollowingList = async () => {
        try {
            const response = await api.get(`/user/following/${userId}`);
            setFollowingList(response.data.data);
        } catch (error) {
            toast.error("Failed to load followings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetFollowingList();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center p-8">
                <Loader size="lg" />
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Following
            </h1>
            <div className="space-y-4">
                {followingList.map((item) => (
                    <ConnectionUserList
                        key={item?.userId?._id}
                        listData={item.userId}
                        isLoggedIn={isLoggedIn}
                        loggedInUserData={currentUserData}
                    />
                ))}
            </div>

            {followingList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-5 p-6 bg-gray-50 rounded-full">
                        <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {userId === currentUserData?._id
                            ? "You're not following anyone yet"
                            : `This user isn't following anyone`}
                    </h3>

                    <p className="text-gray-500 max-w-md mb-6">
                        {userId === currentUserData?._id
                            ? "Follow people to see their updates here."
                            : "When they follow someone, it'll show up here."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Following;
