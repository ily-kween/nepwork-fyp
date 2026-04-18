import React, { useEffect } from "react";
import { Loader } from "../components";
import { Link } from "react-router";
import { FiCheck, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useNotification, useAuth } from "../stores";
import { formatDistanceToNow } from "date-fns";
import { MdPayment, MdWork, MdNotifications } from "react-icons/md";

function Notifications() {
  const { userData } = useAuth();
  const { 
    notifications, 
    loading, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotification();

  useEffect(() => {
    if (userData?._id) {
      fetchNotifications(userData._id);
    }
  }, [userData]);

  const getIcon = (type) => {
    switch (type) {
        case "payment_received":
            return <div className="p-2 bg-green-100 rounded-lg text-green-600 text-xl"><MdPayment /></div>;
        case "job_accepted":
        case "job_applied":
        case "job_started":
        case "job_completed":
            return <div className="p-2 bg-blue-100 rounded-lg text-blue-600 text-xl"><MdWork /></div>;
        default:
            return <div className="p-2 bg-gray-100 rounded-lg text-gray-600 text-xl"><MdNotifications /></div>;
    }
  };

  if (loading && notifications.length === 0) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  You have {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiCheckCircle />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4 text-gray-200"><MdNotifications className="mx-auto" /></div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 transition-colors duration-200 hover:bg-gray-50 flex gap-4 relative group ${!notification.isRead ? "bg-primary/5" : ""}`}
                >
                  {/* Icon based on type */}
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-8">
                        <h3 className={`text-base font-semibold ${!notification.isRead ? "text-primary" : "text-gray-900"}`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 text-sm ${!notification.isRead ? "text-gray-800" : "text-gray-500"}`}>
                          {notification.message}
                        </p>

                        <div className="mt-2 text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>

                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="inline-block mt-3 text-sm font-bold text-primary hover:underline"
                          >
                            View details →
                          </Link>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-100"
                            title="Mark as read"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-100"
                          title="Delete notification"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
