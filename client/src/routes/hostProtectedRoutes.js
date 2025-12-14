import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
const HostProtectedRoute = ({ children }) => {
    const { hostData, loading, error } = useSelector((state) => state.host);
    if (!hostData?.host) {
        return _jsx(Navigate, { to: "/host/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default HostProtectedRoute;
