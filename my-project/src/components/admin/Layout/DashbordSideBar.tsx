import React from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5"; // Menu icons for mobile

const DashboardSideBar = ({ active }: { active: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-20 bg-white p-2 rounded-full shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <IoClose size={25} /> : <IoMenu size={25} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 h-full bg-white shadow-md overflow-y-scroll 
        w-[250px] transition-transform duration-300 md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:w-full md:h-[90vh]`}
      >
        {/* Sidebar Items */}
        <div className="w-full flex flex-col">
          {/* Dashboard */}
          <div className="w-full flex items-center p-4">
            <Link to="/dashboard" className="w-full flex items-center">
              <RxDashboard size={30} color={active === 1 ? "crimson" : "#555"} />
              <h5
                className={`hidden md:block pl-2 text-[18px] font-[400] ${
                  active === 1 ? "text-[crimson]" : "text-[#555]"
                }`}
              >
                Dashboard
              </h5>
            </Link>
          </div>

          {/* Volunteers */}
          <div className="w-full flex items-center p-4">
            <Link to="/admin/dashboard/all-volenteers" className="w-full flex items-center">
              <FiShoppingBag size={30} color={active === 2 ? "crimson" : "#555"} />
              <h5
                className={`hidden md:block pl-2 text-[18px] font-[400] ${
                  active === 2 ? "text-[crimson]" : "text-[#555]"
                }`}
              >
                All Volunteers
              </h5>
            </Link>
          </div>

          {/* Hosts */}
          <div className="w-full flex items-center p-4">
            <Link to="/admin/dashboard/all-hosts" className="w-full flex items-center">
              <FiPackage size={30} color={active === 3 ? "crimson" : "#555"} />
              <h5
                className={`hidden md:block pl-2 text-[18px] font-[400] ${
                  active === 3 ? "text-[crimson]" : "text-[#555]"
                }`}
              >
                All Hosts
              </h5>
            </Link>
          </div>

          {/* Create Event */}
          <div className="w-full flex items-center p-4">
            <Link to="/admin/dashboard/create-blog" className="w-full flex items-center">
              <VscNewFile size={30} color={active === 4 ? "crimson" : "#555"} />
              <h5
                className={`hidden md:block pl-2 text-[18px] font-[400] ${
                  active === 4 ? "text-[crimson]" : "text-[#555]"
                }`}
              >
                Create-blog
              </h5>
            </Link>
          </div>
        </div>
      </div>

      {/* Background overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-5 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default DashboardSideBar;
