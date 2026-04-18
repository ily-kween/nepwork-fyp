import React from "react";
import default_avatar from "../assets/default_avatar.svg";

const UserCard = ({ userData }) => {
    const { emailVerified, kyc, kycStatus, avatar } = userData;
    const { name, dob, document, address, gender, contact } = kyc || {};

    // Status Badge Color Logic
    const statusColor =
        kycStatus === "pending"
            ? "bg-yellow-500"
            : kycStatus === "verified"
              ? "bg-primary"
              : "bg-danger";

    return (
        <div className="w-full max-w-2xl bg-tertiary rounded-2xl shadow-xl border-2 border-secondary hover:border-primary/30 transition-all duration-300 p-4 sm:p-6 lg:p-8 my-4 sm:my-8 mx-auto transform hover:scale-[1.005] group">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-secondary pb-4 sm:pb-6 mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="relative">
                        <img
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-primary bg-tertiary shadow-lg"
                            src={avatar || default_avatar}
                            alt={`Avatar of ${name?.firstName}`}
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-tertiary rounded-full flex items-center justify-center">
                            <span
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${emailVerified ? "bg-primary" : "bg-danger"}`}
                            />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
                            {name?.firstName} {name?.middleName && <>{name?.middleName} </>}{name?.lastName}
                        </h2>
                        <p className="text-secondaryText text-sm sm:text-base mt-1 font-medium">
                            KYC Profile
                        </p>
                    </div>
                </div>
                <span
                    className={`${statusColor} text-tertiary px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide`}
                >
                    {kycStatus === "pending"
                        ? "Pending"
                        : kycStatus === "verified"
                          ? "Verified"
                          : "Failed"}
                </span>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Personal Info Column */}
                <div className="space-y-4 sm:space-y-6">
                    <InfoSection title="Personal Information">
                        <InfoItem label="First Name" value={name?.firstName} />
                        <InfoItem
                            label="Middle Name"
                            value={name?.middleName}
                        />
                        <InfoItem label="Last Name" value={name?.lastName} />
                        <InfoItem
                            label="Date of Birth"
                            value={
                                dob
                                    ? `${dob.year}-${dob.month}-${dob.day}`
                                    : "N/A"
                            }
                        />
                        <InfoItem label="Gender" value={gender} />
                    </InfoSection>

                    <InfoSection title="Contact Information">
                        <InfoItem label="Email" value={contact?.email} />
                        <InfoItem
                            label="Email Verified"
                            value={emailVerified ? "Verified" : "Not Verified"}
                            valueColor={
                                emailVerified ? "text-primary" : "text-danger"
                            }
                        />
                        <InfoItem
                            label="Phone Number"
                            value={contact?.phoneNumber}
                        />
                    </InfoSection>
                </div>

                {/* Address Column */}
                <div className="space-y-4 sm:space-y-6">
                    <InfoSection title="Address Details">
                        <div className="space-y-4">
                            <AddressBlock
                                title="Temporary Address"
                                country={address?.temporary?.country}
                                state={address?.temporary?.state}
                                city={address?.temporary?.city}
                            />
                            <AddressBlock
                                title="Permanent Address"
                                country={address?.permanent?.country}
                                state={address?.permanent?.state}
                                city={address?.permanent?.city}
                            />
                        </div>
                    </InfoSection>
                </div>

                {/* Full-width Documentation Section */}
                <div className="md:col-span-2">
                    <InfoSection title="Documentation">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <InfoItem
                                    label="Document ID"
                                    value={document?.id}
                                />
                                <InfoItem
                                    label="Document Type"
                                    value={document?.type}
                                />
                            </div>
                            {document?.url && (
                                <div className="mt-4 md:mt-0 border-2 border-secondary rounded-xl overflow-hidden hover:border-primary transition-colors">
                                    <img
                                        src={document.url}
                                        alt="Document"
                                        className="w-full h-48 object-cover"
                                    />
                                    <p className="text-center text-sm text-secondaryText p-2 bg-secondary/20">
                                        {document.type} Document
                                    </p>
                                </div>
                            )}
                        </div>
                    </InfoSection>
                </div>
            </div>
        </div>
    );
};

// Reusable Components
const InfoSection = ({ title, children }) => (
    <div className="w-full bg-secondary/10 p-4 sm:p-6 rounded-xl border-2 border-secondary/20">
        <h3 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3 border-l-4 border-primary pl-2 sm:pl-3">
            {title}
        </h3>
        {children}
    </div>
);

const InfoItem = ({ label, value, valueColor = "text-secondaryText" }) =>
    value && (
        <div className="flex justify-between items-start space-x-2">
            <span className="text-xs sm:text-sm font-medium text-secondaryText">
                {label}:
            </span>
            <span
                className={`text-xs sm:text-sm ${valueColor} text-right font-semibold max-w-[60%]`}
            >
                {value || "N/A"}
            </span>
        </div>
    );

const AddressBlock = ({ title, country, state, city }) => (
    <div className="bg-secondary/5 p-3 sm:p-4 rounded-lg border border-secondary/20">
        <h4 className="text-sm font-semibold text-black mb-2">{title}</h4>
        <div className="space-y-1">
            <InfoItem label="Country" value={country} />
            <InfoItem label="State" value={state} />
            <InfoItem label="City" value={city} />
        </div>
    </div>
);

export default UserCard;
