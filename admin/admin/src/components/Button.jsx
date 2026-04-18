import React from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

/*
 * Button Component
 * Props:
 * - id: unique identifier for the button
 * - type: button type (button, submit, reset)
 * - className: additional Tailwind classes
 * - disabled: disables the button
 * - style: outline or filled button styles
 * - onClick: event handler for click event
 * - children: content inside the button
 * - rest: additional props passed to the button element
 */
function Button({
    id,
    type = "button",
    className,
    disabled = false,
    style = "outline",
    onClick,
    children,
    ...rest
}) {
    const baseClasses =
        "px-6 py-2 rounded-md transition ease-in-out duration-150";
    const outlineClasses =
        "border border-primary hover:bg-primary hover:bg-opacity-20 active:bg-opacity-50";
    const filledClasses =
        "border border-primary bg-primary text-primaryText hover:text-black hover:border-opacity-40 hover:bg-opacity-40 active:bg-opacity-90";
    const disabledClasses =
        "cursor-not-allowed hover:bg-opacity-40 bg-opacity-40 hover:text-tertiray active:bg-none";

    return (
        <button
            id={id}
            type={type}
            disabled={disabled}
            className={twMerge(
                `${baseClasses} ${style === "outline" ? outlineClasses : filledClasses} ${disabled ? disabledClasses : ""
                } ${className}`,
            )}
            onClick={!disabled ? onClick : undefined}
            {...rest}
        >
            {children}
        </button>
    );
}

// Prop validation for Button
Button.propTypes = {
    id: PropTypes.string,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    style: PropTypes.oneOf(["outline", "filled"]),
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired, // Ensures children are passed
};

export default Button;

