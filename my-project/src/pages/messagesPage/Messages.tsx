import React from 'react'
import {ChatList,Inbox,Profile} from '../../messageSection/chat/index'

const Messages = () => {
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
