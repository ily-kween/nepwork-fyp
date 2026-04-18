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
 * - variant: button style (outline, filled, premium, ghost, gradient)
 * - onClick: event handler for click event
 * - children: content inside the button
 * - icon: optional icon component
 * - loading: shows loading spinner
 * - rest: additional props passed to the button element
 */
function Button({
    id,
    type = "button",
    className,
    disabled = false,
    loading = false,
    variant = "outline",
    onClick,
    children,
    icon: Icon,
    ...rest
}) {
    const baseStyle =
        "w-fit px-6 py-2.5 rounded-lg text-base flex justify-center items-center cursor-pointer transition-all ease-in-out duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";

    const ButtonVariants = {
        outline: "text-gray-700 border-2 border-primary hover:bg-primary hover:bg-opacity-10 hover:border-primary/80 focus:ring-primary/40",
        filled: "bg-primary text-white hover:bg-primary/90 border-2 border-primary shadow-sm hover:shadow-md focus:ring-primary/40",
        premium: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-lg hover:shadow-emerald-200 focus:ring-emerald-400/40",
        ghost: "text-primary hover:bg-primary/10 border-0 focus:ring-primary/40",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 border-0 shadow-sm hover:shadow-md focus:ring-primary/40",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-0 focus:ring-gray-400/40",
    };

    const disabledStyle =
        "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed hover:bg-gray-300 opacity-60";
    const loadingStyle = "cursor-wait opacity-80 pointer-events-none";

    const buttonVariant = !disabled
        ? ButtonVariants[variant] || ButtonVariants.filled
        : disabledStyle;

    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        onClick?.();
    };

    return (
        <button
            disabled={disabled}
            onClick={handleClick}
            className={twMerge(
                `${baseStyle} ${buttonVariant} ${disabled ? disabledStyle : ""} ${loading ? loadingStyle : ""}`,
                className,
            )}
            {...rest}
        >
            {loading ? (
                <div className="flex justify-center items-center gap-x-2">
                    <span className="w-4 h-4 border-2 border-t-current border-current/30 rounded-full animate-spin"></span>
                    <span>{children}</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{children}</span>
                </div>
            )}
        </button>
    );
}

// Prop validation for Button
Button.propTypes = {
    id: PropTypes.string,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    className: PropTypes.string,
    disabled: PropTypes.bool,
    variant: PropTypes.oneOf(["outline", "filled", "premium", "ghost", "gradient", "secondary"]),
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
    icon: PropTypes.elementType,
    loading: PropTypes.bool,
};

export default Button;
