import { twMerge } from "tailwind-merge";

function Tag({ title, className }) {
    return (
        <span
            className={twMerge(
                `bg-primary bg-opacity-20 text-gray-800  px-2.5 py-1 rounded-xl text-xs ${className}`,
            )}
        >
            {title}
        </span>
    );
}

export default Tag;
