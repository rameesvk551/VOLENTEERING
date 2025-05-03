// components/ChatList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  FaComments,
  FaPhone,
  FaSearch,
  FaPhoneAlt,
  FaArrowDown,
  FaArrowUp,
  FaTimesCircle,
} from 'react-icons/fa';
import server from '@/server/app';
import { setSelectedUser } from '@/redux/Slices/messageSlice';
import { RootState } from '@/redux/store';

type Role = 'all' | 'volunteer' | 'host';

interface User {
  _id: string;
  firstName: string;
  profileImage: string;
  role?: string;
  lastMessage?: string;
  lastMessageTime:Date
}

interface Call {
  id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  user: User;
}

const ChatList: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((s: RootState) => s.message);

  const [users, setUsers] = useState<User[]>([]);
  const [calls, setCalls] = useState<Call[]>([]); // mock or fetch real
  const [tab, setTab] = useState<'chats' | 'calls'>('chats');
  const [filter, setFilter] = useState<Role>('all');
  const [search, setSearch] = useState('');



  // — Fetch users once —
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<{ users: User[] }>(
          `${server}/message/get-all-users`,
          { withCredentials: true }
        );
        setUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch users', err);
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

  return (
    <div className='  w-full sm:w-1/3 md:w-1/4 h-[87vh] py-3 pl-2 bg-gray-100'>
    <div className=" flex flex-col h-full border rounded-xl shadow bg-white overflow-hidden  ">
      {/* — Tabs Header — */}
      <div className="flex border-b">
        <TabButton icon={<FaComments />} active={tab === 'chats'} onClick={() => setTab('chats')}>
          Chats
        </TabButton>
        <TabButton icon={<FaPhone />} active={tab === 'calls'} onClick={() => setTab('calls')}>
          Calls
        </TabButton>
      </div>

      {/* — Search & Filter (Chats only) — */}
      {tab === 'chats' && (
        <div className="p-3 border-b flex flex-col gap-3">
          <div className="relative text-gray-500">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-center text-xs font-medium">
            {(['all', 'volunteer', 'host'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1 rounded-full transition ${
                  filter === r
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* — List Section — */}
      <div className="flex-1 overflow-y-auto bg-white">
        {tab === 'chats' ? (
          displayedUsers.map(u => (
            <ChatListItem
              key={u._id}
              user={u}
              selected={u._id === selectedUser?._id}
              onClick={() => dispatch(setSelectedUser(u))}
            />
          ))
        ) : calls.length > 0 ? (
          calls.map(c => <CallListItem key={c.id} call={c} />)
        ) : (
          <NoCallsPlaceholder />
        )}
      </div>
    </div>
    </div>
  );
};

/** Tab button component **/
const TabButton: React.FC<{
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  children: string;
}> = ({ icon, active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 flex items-center justify-center gap-1 text-sm font-medium transition ${
      active ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-800'
    }`}
  >
    {icon} {children.toUpperCase()}
  </button>
);


const ChatListItem: React.FC<{
  user: User;
  selected: boolean;
  onClick: () => void;
}> = ({ user, selected, onClick }) => {
  const {onlineUsers} = useSelector((state: RootState) => state.socket);
  const isOnline = onlineUsers.includes(user._id); 
console.log("oooooooooooooooonnnnnnnnnnnnnnnnnnnn",isOnline,onlineUsers);

  const formattedTime = useMemo(() => {
    const dateString = user?.lastMessageTime;
    if (!dateString) return '';

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
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }, [user?.lastMessageTime]);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition ${
        selected ? 'bg-indigo-50' : 'hover:bg-indigo-50'
      }`}
    >
      <div className="relative w-12 h-12">
        <img
          src={user.profileImage}
          alt={user.firstName}
          className="w-full h-full rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-800">{user.firstName}</span>
          <span className="text-[11px] text-gray-400">{formattedTime}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {user.lastMessage || 'No messages yet'}
        </p>
      </div>
    </div>
  );
};


/** Single call list item **/
const CallListItem: React.FC<{ call: Call }> = ({ call }) => {
  const Icon = call.type === 'incoming' ? FaArrowDown : call.type === 'outgoing' ? FaArrowUp : FaTimesCircle;
  const color = call.type === 'missed' ? 'text-red-500' : 'text-green-500';

  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition">
      <div className="relative w-10 h-10">
        <img
          src={call.user.profileImage}
          alt={call.user.firstName}
          className="w-full h-full rounded-full object-cover"
        />
        <Icon className={`absolute bottom-0 right-0 w-4 h-4 ${color} bg-white rounded-full p-0.5`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="font-medium text-gray-800">{call.user.firstName}</span>
          <span className="text-xs text-gray-500">{call.time}</span>
        </div>
        <p className="text-xs text-gray-500 capitalize">{call.type} call</p>
      </div>
    </div>
  );
};

/** Placeholder when there are no calls **/
const NoCallsPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
    <FaPhoneAlt className="text-3xl mb-2" />
    <p className="mb-1">No call history yet</p>
    <small>Start a chat to make a call</small>
  </div>
);

export default ChatList;
