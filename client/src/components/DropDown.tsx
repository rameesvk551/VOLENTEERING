import React, { useEffect, useRef, useState } from 'react'
import { set } from 'react-hook-form'
import { CiMenuKebab } from 'react-icons/ci'
import { GiTargeted } from 'react-icons/gi'

const DropDown:React.FC = () => {
    const [dropDownOpen,setDropDownOpen]=useState<boolean>()
    const trigger=useRef<HTMLDivElement>(null)
   const DropDown =useRef<HTMLButtonElement>(null)

   useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!DropDown.current || !trigger.current) return;

      if (
        DropDown.current.contains(event.target as Node) || 
        trigger.current.contains(event.target as Node)
      ) {
        return;
      }

      setDropDownOpen(false);
    };

    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!dropDownOpen || event.key !== "Escape") return;
      setDropDownOpen(false);
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropDownOpen]);
  return (
    <div className='relative flex'>
        <button className='text-[#98A6AD] hover:text-gray-200' ref={trigger} onClick={()=>setDropDownOpen((prev)=>!prev)}>
               <CiMenuKebab size={24}  />
        </button>
        <div className={`absolute right-0 top-full z-40 w-40 space-y-1 rounded-sm border-gray-600 bg-white p-1.5 shadow-default ${dropDownOpen === true ?"block":"hidden"}`} ref={DropDown} onFocus={()=>setDropDownOpen(true)} onBlur={()=>setDropDownOpen(false)}>
            <button className="flex  w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray-100">Archived Messages</button>
            <button className="flex  w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray-100">UnAnswered</button>
      
        
        </div>
      
    </div>
  )
}

export default DropDown
