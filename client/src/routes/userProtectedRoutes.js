import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
const UserProtectedRoute = ({ children }) => {
    const { volenteerData, isAuthenticated } = useSelector((state) => state.volenteer);
    console.log("vvvvvvvvvvvvvvolenteering", volenteerData); // this is getting
    if (!volenteerData?.user?.user) {
        return _jsx(Navigate, { to: "/user/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default UserProtectedRoute;
