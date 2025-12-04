import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { ChatList, Inbox } from '../../messageSection/chat/index';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { loadVolenteer } from '@/redux/thunks/volenteerThunk';
import { connectSocket } from '@/lib/socket';
import { loadHost } from '@/redux/thunks/hostTunk';
const Messages = () => {
    const { hostData, loading, error } = useSelector((state) => state.host);
    const user = useSelector((state) => state.volenteer.volenteerData);
    const dispatch = useDispatch();
    useEffect(() => {
        if (!hostData?.host) {
            dispatch(loadHost());
            console.log("host data fetching...");
        }
        if (!user?._id) {
            dispatch(loadVolenteer());
            console.log("volunteer data fetching...");
        }
    }, []);
    useEffect(() => {
        const userId = user?.user?._id || hostData?.host?._id;
        console.log("uuuuuuseriddddddd", user);
        if (userId) {
            console.log("Connecting socket with userId:", userId);
            connectSocket(userId);
        }
    }, [user, hostData]);
    console.log("hhhhhhhhhhhhhhhhhhost ", user);
    return (_jsxs("div", { className: ' overflow-hidden flex ', children: [_jsx(ChatList, {}), _jsx(Inbox, {})] }));
};
export default Messages;
