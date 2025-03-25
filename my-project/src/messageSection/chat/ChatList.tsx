import React from 'react'
import { CiMenuKebab, CiSearch } from 'react-icons/ci'
import Divider from '../../components/Divider'

import User01 from "../../images/user/user-01.png";
import User02 from "../../images/user/user-02.png";
import User03 from "../../images/user/user-03.png";
import User04 from "../../images/user/user-04.png";
import User05 from "../../images/user/user-05.png";
import User06 from "../../images/user/user-06.png";
import User07 from "../../images/user/user-07.png";
import User08 from "../../images/user/user-08.png";

const List = [
  {
    imgSrc: User01,
    name: "Henry Dholi",
    message: "I cam across your profile and...",
  },
  {
    imgSrc: User02,
    name: "Mariya Desoja",
    message: "I like your confidence 💪",
  },
  {
    imgSrc: User03,
    name: "Robert Jhon",
    message: "Can you share your offer?",
  },
  {
    imgSrc: User04,
    name: "Cody Fisher",
    message: `I'm waiting for you response!`,
  },
  {
    imgSrc: User05,
    name: "Jenny Wilson",
    message: "I cam across your profile and...",
  },
  {
    imgSrc: User06,
    name: "Robert Jhon",
    message: "Can you share your offer?",
  },
  {
    imgSrc: User07,
    name: "Cody Fisher",
    message: `I'm waiting for you response!`,
  },
  {
    imgSrc: User08,
    name: "Jenny Wilson",
    message: "I cam across your profile and...",
  },
];



const ChatList = () => {
  return (
    <div className='w-1/4 bg-red-400 h-[100vh]'>
     <div className="flex justify-between px-3 py-3">
      <h1> My Messages</h1>
      <CiMenuKebab  />
     </div>

     <div className="flex flex-row px-5 gap-2">
      <button className='bg-slate-400 rounded-lg px-7 py-1'>All</button>
      <button className='bg-slate-400 rounded-lg px-7 py-1'>Host</button>
      <button className='bg-slate-400 rounded-lg px-7 py-1'>Travellers</button>
     </div>
     <div className="flex max-h-full flex-col overflow-auto p-5">
      <form action="" className="sticky mb-4">
        <input type="text" placeholder='Search... ' className='w-full rounded border border-stroke
         bg-gray-50 py-1 pl-5 pr-10 text-sm outline-none focus:border-gray-500'/>
         <button className="absolute right-4 top-1/2 -translate-y-1/2">
         <CiSearch size={20} /></button>
      </form>
     </div>
     <Divider/>

     <div className='-ms-overflow-style-none scrollbar-w-none'>
      {List.map((object,item)=>(
<div className='flex cursor-pointer items-center rounded px-4 py-2 hover:bg-gray-200 ' key={item}>
  <div className='relative mr-2.5 h-11 w-full max-w-11 rounded-full'>
    <img src={object.imgSrc} alt="profile" className='h-full w-full rounded-full object-cover object-center'/>
    <span className='absolute  bottom-0 block h-3 w-3 rounded-full border-2 border-gray-200 bg-green-500'></span>
  </div>
  <div className="w-full ">
    <h5 className="text-sm font-medium text-black">{object.name}</h5>
  </div>

</div>
      ))}
     </div>

    </div>
  )
}

export default ChatList
