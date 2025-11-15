import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// components/ChatList.tsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaComments, FaPhone, FaSearch, FaPhoneAlt, FaArrowDown, FaArrowUp, FaTimesCircle, FaPhoneSlash, } from 'react-icons/fa';
import server from '@/server/app';
import { setSelectedUser } from '@/redux/Slices/messageSlice';
const ChatList = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector((s) => s.message);
    const [users, setUsers] = useState([]);
    const [calls, setCalls] = useState([]); // mock or fetch real
    const [tab, setTab] = useState('chats');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`${server}/message/get-all-users`, { withCredentials: true });
                setUsers(data.users);
            }
            catch (err) {
                console.error('Failed to fetch users', err);
            }
            try {
                const { data } = await axios.get(`${server}/call/get-calls`, { withCredentials: true });
                setCalls(data.calls);
            }
            catch (err) {
                console.error('Failed to fetch calls', err);
            }
        })();
    }, []);
    // — Default to first user if none selected —
    useEffect(() => {
        if (!selectedUser && users.length) {
            dispatch(setSelectedUser(users[0]));
        }
    }, [users, selectedUser, dispatch]);
    // — Apply filter + search —
    const displayedUsers = users
        .filter(u => filter === 'all' || u.role === filter)
        .filter(u => u.firstName.toLowerCase().includes(search.toLowerCase()));
    return (_jsx("div", { className: '  w-full sm:w-1/3 md:w-1/4 h-[87vh] py-3 pl-2 bg-gray-100', children: _jsxs("div", { className: " flex flex-col h-full border rounded-xl shadow bg-white overflow-hidden  ", children: [_jsxs("div", { className: "flex border-b", children: [_jsx(TabButton, { icon: _jsx(FaComments, {}), active: tab === 'chats', onClick: () => setTab('chats'), children: "Chats" }), _jsx(TabButton, { icon: _jsx(FaPhone, {}), active: tab === 'calls', onClick: () => setTab('calls'), children: "Calls" })] }), tab === 'chats' && (_jsxs("div", { className: "p-3 border-b flex flex-col gap-3", children: [_jsxs("div", { className: "relative text-gray-500", children: [_jsx(FaSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2" }), _jsx("input", { type: "text", className: "w-full pl-10 pr-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400", placeholder: "Search users\u2026", value: search, onChange: e => setSearch(e.target.value) })] }), _jsx("div", { className: "flex gap-2 justify-center text-xs font-medium", children: ['all', 'volunteer', 'host'].map(r => (_jsx("button", { onClick: () => setFilter(r), className: `px-3 py-1 rounded-full transition ${filter === r
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`, children: r.charAt(0).toUpperCase() + r.slice(1) }, r))) })] })), _jsx("div", { className: "flex-1 overflow-y-auto bg-white", children: tab === 'chats' ? (displayedUsers.map(u => (_jsx(ChatListItem, { user: u, selected: u._id === selectedUser?._id, onClick: () => dispatch(setSelectedUser(u)) }, u._id)))) : calls.length > 0 ? (calls.map(c => _jsx(CallListItem, { call: c }, c.id))) : (_jsx(NoCallsPlaceholder, {})) })] }) }));
};
/** Tab button component **/
const TabButton = ({ icon, active, onClick, children }) => (_jsxs("button", { onClick: onClick, className: `flex-1 py-3 flex items-center justify-center gap-1 text-sm font-medium transition ${active ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`, children: [icon, " ", children.toUpperCase()] }));
const ChatListItem = ({ user, selected, onClick }) => {
    const { onlineUsers } = useSelector((state) => state.socket);
    const isOnline = onlineUsers.includes(user._id);
    const formattedTime = useMemo(() => {
        const dateString = user?.lastMessageTime;
        if (!dateString)
            return '';
        const messageDate = new Date(dateString);
        const now = new Date();
        const isToday = messageDate.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = messageDate.toDateString() === yesterday.toDateString();
        if (isToday) {
            return messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        else if (isYesterday) {
            return 'Yesterday';
        }
        else {
            return messageDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    }, [user?.lastMessageTime]);
    return (_jsxs("div", { onClick: onClick, className: `flex items-center gap-3 px-4 py-2 cursor-pointer transition ${selected ? 'bg-indigo-50' : 'hover:bg-indigo-50'}`, children: [_jsxs("div", { className: "relative w-12 h-12", children: [_jsx("img", { src: user.profileImage, alt: user.firstName, className: "w-full h-full rounded-full object-cover" }), isOnline && (_jsx("span", { className: "absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" }))] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium text-gray-800", children: user.firstName }), _jsx("span", { className: "text-[11px] text-gray-400", children: formattedTime })] }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user.lastMessage || 'No messages yet' })] })] }));
};
const CallListItem = ({ call }) => {
    const DirectionIcon = call.type === 'incoming'
        ? FaArrowDown
        : call.type === 'outgoing'
            ? FaArrowUp
            : FaTimesCircle;
    const directionColor = call.type === 'missed'
        ? 'text-red-500'
        : call.type === 'incoming'
            ? 'text-blue-500'
            : 'text-green-500';
    const statusBadge = useMemo(() => {
        switch (call.status) {
            case 'missed':
                return { color: 'bg-red-100 text-red-600', icon: _jsx(FaTimesCircle, { className: "w-3 h-3 mr-1" }) };
            case 'rejected':
                return { color: 'bg-yellow-100 text-yellow-600', icon: _jsx(FaPhoneSlash, { className: "w-3 h-3 mr-1" }) };
            case 'ongoing':
                return { color: 'bg-blue-100 text-blue-600', icon: _jsx(FaPhoneAlt, { className: "w-3 h-3 animate-pulse mr-1" }) };
            default:
                return null;
        }
    }, [call.status]);
    const formattedTime = useMemo(() => {
        const messageDate = new Date(call.time);
        const now = new Date();
        const isToday = messageDate.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = messageDate.toDateString() === yesterday.toDateString();
        if (isToday) {
            return messageDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        else if (isYesterday) {
            return 'Yesterday';
        }
        else {
            return messageDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    }, [call.time]);
    return (_jsxs("div", { className: "flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-100 transition shadow-sm", children: [_jsxs("div", { className: "relative w-12 h-12", children: [_jsx("img", { src: call.user?.profileImage, alt: call.user?.firstName, className: "w-full h-full rounded-full object-cover border-2 border-white shadow-sm" }), _jsx("div", { className: "absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm", children: _jsx(DirectionIcon, { className: `w-4 h-4 ${directionColor}` }) })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-semibold text-gray-800 truncate", children: call.user?.firstName }), _jsx("span", { className: "text-xs text-gray-500", children: formattedTime })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("p", { className: "text-sm text-gray-500 capitalize", children: [call.type, " call"] }), statusBadge && (_jsx("span", { className: `inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.color}`, children: statusBadge.icon }))] })] })] }));
};
/** Placeholder when there are no calls **/
const NoCallsPlaceholder = () => (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-gray-500 p-6", children: [_jsx(FaPhoneAlt, { className: "text-3xl mb-2" }), _jsx("p", { className: "mb-1", children: "No call history yet" }), _jsx("small", { children: "Start a chat to make a call" })] }));
export default ChatList;
