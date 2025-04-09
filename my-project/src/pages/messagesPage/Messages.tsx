import React, { useEffect } from 'react'
import {ChatList,Inbox,Profile} from '../../messageSection/chat/index'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { loadVolenteer } from '@/redux/thunks/volenteerThunk';
import { AppDispatch, RootState } from '@/redux/store';
import { connectSocket } from '@/lib/socket';

const Messages = () => {

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(loadVolenteer()).then((res: any) => {
      console.log("ressss",res);
      
      const userId = res?.payload?.user?._id;
      console.log("userIdddddddd",userId);
      
      if (userId) {
        connectSocket(userId);
      }
    });
    
  }, []);

  const { volenteerData } = useSelector((state: RootState) => state.volenteer);


  return (
    <div className='h-screen overflow-hidden flex '>
   
                {/**chatlist */}
                <ChatList/>  
                {/**Inbox */}
                <Inbox/>
                {/**profile */}

         
    
    </div>
  )
}

export default Messages
