import React from "react";

interface ButtonProps {
  label: string;
  styles?: string;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, styles, icon, type = "button", onClick }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`flex items-center justify-center text-base outline-none ${styles}`}
    >
      {label}
      {icon && <div className="ml-2">{icon}</div>}
    </button>
  );
};

export default Button;
