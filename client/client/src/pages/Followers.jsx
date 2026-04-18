import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import api from "../utils/api";
import { useAuth } from "../stores";
import { ConnectionUserList, Loader } from "../components";

function Followers() {
    const { userId } = useParams();
    const { isLoggedIn, userData: currentUserData } = useAuth();
    const [followersList, setFollowersList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSetFollowerList = async () => {
        try {
            const response = await api.get(`/user/followers/${userId}`);
            setFollowersList(response.data.data);
        } catch (error) {
            toast.error("Failed to load followers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetFollowerList();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center p-8">
                <Loader />
            </div>
        );

    return (
        <div className="max-w-2xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Followers
            </h1>
            <div className="space-y-4">
                {followersList.map((item) => (
                    <ConnectionUserList
                        key={item?.userId?._id}
                        listData={item.userId}
                        isLoggedIn={isLoggedIn}
                        loggedInUserData={currentUserData}
                    />
                ))}
            </div>

            {followersList.length === 0 && (
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
                            ? "You don't have any followers yet"
                            : "This user doesn't have any followers yet."}
                    </h3>

                    <p className="text-gray-500 max-w-md mb-6">
                        {userId === currentUserData?._id
                            ? "When someone follows you, it'll show up here."
                            : "When someone them, it'll show up here."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Followers;
