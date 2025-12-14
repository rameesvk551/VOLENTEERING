import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BiError } from 'react-icons/bi';
const HostDetailsErrorPage = ({ error }) => {
    return (_jsx("div", { className: "h-screen w-full flex items-center justify-center bg-gray-50 px-4", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(BiError, { className: "text-red-500", size: 64 }) }), _jsx("h1", { className: "text-2xl font-semibold text-red-600 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-gray-700", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition", children: "Try Again" })] }) }));
};
export default HostDetailsErrorPage;
