import React from 'react';

interface InputboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRequired?: boolean;
}

const Inputbox = React.forwardRef<HTMLInputElement, InputboxProps>(
  ({ label, isRequired, ...rest }, ref) => {
    return (
      <div>
        {label && (
          <label>
            {label} {isRequired && "*"}
          </label>
        )}
        <input ref={ref} {...rest} />
      </div>
    );
  }
);

export default Inputbox;
