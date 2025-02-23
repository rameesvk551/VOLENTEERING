import React from "react";

interface InputboxProps {
  label: string;
  name: string;
  type: string;
  isRequired?: boolean;
  placeholder?: string;
  className:string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Inputbox: React.FC<InputboxProps> = ({
  label,
  name,
  type,
  isRequired = false,
  placeholder,
className,
...rest
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={name} className="text-slate-900 dark:text-gray-500">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={isRequired}
        className={className}
        placeholder={placeholder}
        {...rest}
       
      />
    </div>
  );
};

export default Inputbox;
