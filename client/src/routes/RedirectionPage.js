import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
const RedirectRoute = ({ children }) => {
    const { hostData, loading, error } = useSelector((state) => state.host);
    const { volenteerData, isAuthenticated } = useSelector((state) => state.volenteer);
    if (hostData?.host || isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default RedirectRoute;
