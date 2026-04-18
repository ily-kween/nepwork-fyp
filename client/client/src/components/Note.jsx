import React from "react";
import { GoInfo } from "react-icons/go";
import { AiOutlineWarning } from "react-icons/ai";

function Note({ children, type = "note" }) {
    let styles = {
        note: {
            container: "my-2 flex items-center gap-2 border-l-4 border-blue-500 bg-blue-100 text-blue-800 p-3 rounded shadow-md",
            icon: <GoInfo className="text-xl" />,
        },
        warning: {
            container: "my-2 flex items-center gap-2 border-l-4 border-yellow-500 bg-yellow-100 text-yellow-800 p-3 rounded shadow-md",
            icon: <AiOutlineWarning className="text-xl" />,
        },
    };

    const { container, icon } = styles[type] || styles.note;

    return (
        <div className={container}>
            {icon}
            <span className="font-medium">{children}</span>
        </div>
    );
}

export default Note;
