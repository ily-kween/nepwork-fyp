import React from "react";
import {
    IoCloseSharp,
    IoPersonOutline,
    IoMailOutline,
    IoDocumentTextOutline,
} from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { useSetting } from "../stores";
import { Link } from "react-router";
import Button from "./Button";

function SettingSlide() {
    const close = useSetting((state) => state.close);

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={close}
        >
            <div
                className="absolute right-0 top-0 h-full w-full max-w-md transform transition-transform duration-300 ease-in-out cursor-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-full bg-tertiary shadow-2xl animate-slideIn flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-secondary p-4 md:p-6">
                        <h2 className="text-xl md:text-2xl font-bold text-secondaryText">
                            Settings
                        </h2>
                        <button
                            onClick={close}
                            className="rounded-full p-1 md:p-2 hover:bg-secondary transition-colors duration-200"
                            aria-label="Close settings"
                        >
                            <IoCloseSharp className="text-2xl md:text-3xl text-secondaryText" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="p-2 md:p-4 flex-1 overflow-y-auto">

                        <Link
                            to="/settings/verify-email"
                            className="flex items-center gap-3 rounded-lg p-3 md:p-4 text-secondaryText hover:bg-secondary transition-colors duration-200"
                            onClick={close}
                        >
                            <IoMailOutline className="text-lg md:text-xl" />
                            <span className="text-sm md:text-base font-medium">
                                Verify Email
                            </span>
                        </Link>

                        <Link
                            to="/settings/kyc"
                            className="flex items-center gap-3 rounded-lg p-3 md:p-4 text-secondaryText hover:bg-secondary transition-colors duration-200"
                            onClick={close}
                        >
                            <IoDocumentTextOutline className="text-lg md:text-xl" />
                            <span className="text-sm md:text-base font-medium">
                                KYC Verification
                            </span>
                        </Link>
                    </nav>

                    {/* Logout Button */}
                    <div className="sticky bottom-0 border-t border-secondary bg-tertiary p-4 md:p-6">
                        <Link to="/logout" onClick={close}>
                            <Button
                                variant="filled"
                                theme="danger"
                                className="w-full items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-lg bg-red-500 border-red-500"
                            >
                                <TbLogout className="text-lg md:text-xl" />
                                Logout
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingSlide;
