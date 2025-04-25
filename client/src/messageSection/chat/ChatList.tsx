import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import server from '@/server/app';
import { setSelectedUser } from '@/redux/Slices/messageSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const ChatList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'volunteer' | 'host'>('all');
  const dispatch = useDispatch();

  interface User {
    _id: string;
    firstName: string;
    profileImage: string;
    role?: string; // Assuming role field exists
  }
  const {  selectedUser } = useSelector((state: RootState) => state.message);
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      dispatch(setSelectedUser(users[0]));
    }
  }, [users, selectedUser, dispatch]);
  

  const handleUserClick = (user: User) => {
    dispatch(setSelectedUser(user));
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${server}/message/get-all-users`, {
          withCredentials: true,
        });
        setUsers(res.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full sm:w-1/3 md:w-1/4 bg-white h-[87vh] shadow-lg overflow-y-auto rounded-r-2xl">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chats</h2>
        <div className="flex gap-2 text-sm font-medium text-gray-600">
          {['all', 'Volunteer', 'host'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role as 'all' | 'volunteer' | 'host')}
              className={`px-3 py-1 rounded-full transition ${
                filter === role
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 space-y-2">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserClick(user)}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition hover:bg-blue-50"
          >
            <div className="relative min-w-[44px] h-11">
              <img
                src={user.profileImage}
                alt="profile"
                className="h-11 w-11 rounded-full object-cover border border-gray-200"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex-1">
              <p className="text-gray-800 font-medium text-sm">{user.firstName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role || 'User'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
