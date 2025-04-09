import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import axios from 'axios';
import server from '@/server/app';
import { setSelectedUser } from '@/redux/Slices/chatSlice';

const ChatList = () => {
  const [users, setUsers] = useState<User[]>([]);

  const dispatch = useDispatch();
  interface User {
    _id: string;
    firstName: string;
    profileImage:string
    // Add any other user fields if needed
  }
  const handleUserClick = (user: User) => {

    dispatch(setSelectedUser(user));
  };
  


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${server}/message/get-all-users`,{withCredentials:true});
        setUsers(res.data.users);       
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className='w-1/4 bg-red-400 h-[100vh]'>
      {/* ... Search + filter UI */}

      <div className='-ms-overflow-style-none scrollbar-w-none'>
        {users.map((user) => (
          <div
            className='flex cursor-pointer items-center rounded px-4 py-2 hover:bg-gray-200'
            key={user._id}
            onClick={() => handleUserClick(user)}
          >
            <div className='relative mr-2.5 h-11 w-full max-w-11 rounded-full'>
              <img src={user.profileImage} alt="profile" className='h-full w-full rounded-full object-cover object-center' />
              <span className='absolute bottom-0 block h-3 w-3 rounded-full border-2 border-gray-200 bg-green-500'></span>
            </div>
            <div className="w-full">
              <h5 className="text-sm font-medium text-black">{user.firstName}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
