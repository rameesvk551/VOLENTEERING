import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const Inputbox = React.forwardRef(({ label, isRequired, ...rest }, ref) => {
    return (_jsxs("div", { children: [label && (_jsxs("label", { children: [label, " ", isRequired && "*"] })), _jsx("input", { ref: ref, ...rest })] }));
});
export default Inputbox;
