import React, { useEffect, useState } from "react";
import Button from "../Button";
import api from "../../utils/api";
import Loader from "../Loader";
import { Link } from "react-router";

function ClientPostedJobs({ clientId }) {
    const [jobs, setJobs] = useState([]);
    const [fetching, setFetching] = useState(true);

    const fetchSetJobs = async () => {
        try {
            const response = await api.get(`/jobs/${clientId}/open-jobs`);
            setJobs(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };
    useEffect(() => {
        fetchSetJobs();
    }, []);

    const getTimeSincePosted = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const timeDifference = Math.floor((now - createdTime) / 1000);

        if (timeDifference < 60) {
            return `${timeDifference} seconds ago`;
        } else if (timeDifference < 3600) {
            const minutes = Math.floor(timeDifference / 60);
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else if (timeDifference < 86400) {
            const hours = Math.floor(timeDifference / 3600);
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(timeDifference / 86400);
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }
    };

    return (
        <section className="bg-white rounded-xl p-6 shadow-sm mb-8 max-h-[600px] overflow-y-scroll">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Posted Projects
            </h2>
            {fetching ? (
                <Loader />
            ) : jobs.length === 0 ? (
                <div className="text-center mt-5 text-gray-700">
                    {" "}
                    No any open projects{" "}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {jobs.map((job) => (
                        <div
                            key={job?._id}
                            className="h-[200px] overflow-y-scroll border rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {job?.title}
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {getTimeSincePosted(job?.createdAt)}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                {job.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-blue-600 text-sm">
                                    Rs. {job.hourlyRate.toLocaleString()} / hr
                                </span>
                                <Link to={`/jobs/${job?._id}`}>
                                    <Button
                                        variant="outline"
                                        className="px-3 py-1.5 text-sm"
                                    >
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ClientPostedJobs;
