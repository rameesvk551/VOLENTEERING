import React from 'react'
import {ChatList,Inbox,Profile} from '../../messageSection/chat/index'
import VoiceRecorder from '../../components/VoiceRecorder'

const Messages = () => {
  return (
    <div className='h-screen overflow-hidden flex '>
   
                {/**chatlist */}
                <ChatList/>  
                {/**Inbox */}
                <Inbox/>
                {/**profile */}

                {/**<VoiceRecorder/> */}

    
    </div>
  )
}

export default Messages
