import { Link, useNavigate } from "react-router";
import Button from "./Button";
import default_avatar from "../assets/default_avatar.svg";
import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import capitalize from "../utils/capitalize";

function ConnectionUserList({ listData, isLoggedIn, loggedInUserData }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isCurrentLoggedUserFollowing, setIsCurrentLoggedUserFollowing] =
        useState(false);

    useEffect(() => {
        validateFollowing();
    }, []);

    const validateFollowing = () => {
        const isCurrentLoggedUserFollowing = loggedInUserData?.following.some(
            (item) => item?.userId === listData?._id,
        );
        if (isCurrentLoggedUserFollowing) setIsCurrentLoggedUserFollowing(true);
        else setIsCurrentLoggedUserFollowing(false);
    };

    const handleToogleFollowUnfollow = async (targetId) => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        setLoading(true);

        if (isCurrentLoggedUserFollowing) {
            try {
                await api.post(`/user/${targetId}/unfollow`);
                setIsCurrentLoggedUserFollowing(false);
                toast.success(
                    `Unfollowed ${capitalize(listData.name.firstName)} ${capitalize(listData.name.lastName)}`,
                );
            } catch (error) {
                toast.error(
                    `Failed to unfollow ${capitalize(listData.name.firstName)} ${capitalize(listData.name.lastName)}`,
                );
                console.error(error);
            } finally {
                setLoading(false);
            }
        } else {
            try {
                await api.post(`/user/${targetId}/follow`);
                setIsCurrentLoggedUserFollowing(true);
                toast.success(
                    `Followed ${capitalize(listData.name.firstName)} ${capitalize(listData.name.lastName)}`,
                );
            } catch (error) {
                toast.error(
                    `Failed to follow ${capitalize(listData.name.firstName)} ${capitalize(listData.name.lastName)}`,
                );
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-4">
                <img
                    src={listData?.avatar ?? default_avatar}
                    alt={`${listData?.name?.firstName} avatar`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 hover:border-blue-200 transition-colors duration-200"
                />
                <div>
                    <h3 className="font-semibold text-gray-800 hover:underline hover:text-blue-800">
                        <Link to={`/profile/${listData?._id}`}>
                        {capitalize(listData?.name?.firstName)}{" "}
                        {capitalize(listData?.name?.lastName)}
                        </Link>
                    </h3>
                    {listData?.bio && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                            {listData.bio}
                        </p>
                    )}
                </div>
            </div>

            {isLoggedIn && loggedInUserData ? (
                <Button
                    loading={loading}
                    disabled={loading}
                    variant={
                        isCurrentLoggedUserFollowing ? "outline" : "filled"
                    }
                    onClick={() => handleToogleFollowUnfollow(listData?._id)}
                    className={`px-6 py-2 rounded-full text-sm transition-all duration-200 ${loggedInUserData?._id === listData?._id && "hidden"}`}
                >
                    {isCurrentLoggedUserFollowing ? "Unfollow" : "Follow"}
                </Button>
            ) : (
                <Button
                    variant="filled"
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 rounded-full text-sm"
                >
                    Follow
                </Button>
            )}
        </div>
    );
}

export default ConnectionUserList;
