import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHeart, FaTimes,  FaEnvelope } from "react-icons/fa";
import { MdHotel, MdOutlineFlight } from "react-icons/md";
import { FaTaxi } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";

const Navbar = () => {
 
  const [showProfileMenu,setShowProfileMenu]=useState<boolean>(false)
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { id: 1, icon: <MdOutlineFlight size={22} className="text-black" />, text: "Flight" },
    { id: 2, icon: <FaTaxi size={22} className="text-black" />, text: "Car Rental" },
    { id: 3, icon: <MdHotel size={22} className="text-black" />, text: "Stay" },
    { id: 4, icon: <FaEnvelope size={22} className="text-black" />, text: "Volunteering" },
    { id: 5, icon: <MdOutlineFlight size={22} className="text-black" />, text: "Tours" },
    { id: 6, icon: <FaTaxi size={22} className="text-black" />, text: "Plan Your Trip" },
    { id: 7, icon: <FaEnvelope size={22} className="text-black" />, text: "Contact" },
  ];
  // Close sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
    const { volenteerData,isAuthenticated } = useSelector((state: RootState) => state.volenteer);
  
  return (
    <div>
      {/* Navbar */}
      <div className="h-20 w-full bg-gray-50 shadow-md py-3 px-6 flex items-center justify-between">
        {/* Left - Logo & Menu */}
        <div className="flex items-center gap-4">
          <GiHamburgerMenu
            size={30}
            className="cursor-pointer text-gray-700 hover:text-gray-900 transition"
            onClick={() => setIsOpen(true)}
          />
          <h5 className="text-3xl font-bold tracking-widest text-gray-900 uppercase">
            <span className="bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
              RAIH
            </span>
          </h5>
        </div>

        <div className="flex items-center gap-4 relative">
      {/* Favorite Button */}
      <button className="flex items-center justify-center p-2 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md">
        <FaHeart size={20} />
      </button>

      {/* If logged in, show profile */}
      {isAuthenticated ? (
        <div className="relative">
          {/* Profile Picture */}
          <img
            src={"/default-avatar.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-all"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          />

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
              <div className="px-5 py-4 text-gray-800 font-semibold text-center bg-gray-100">
               {volenteerData.d.name}
              </div>
              <hr />
              <button className="w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-all">
                Profile
              </button>
              <button className="w-full text-left px-5 py-3 text-red-500 hover:bg-gray-100 transition-all">
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (


  <button className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md">
    Sign In
  </button>


      )}
    </div>

      </div>

      {/* Sidebar Modal (Left Side) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-md rounded-r-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Close Button */}
        <div className="p-4 flex justify-end">
          <FaTimes
            size={24}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Menu Items */}
        <ul className="px-6 py-4 text-gray-700 space-y-4">
  {menuItems &&
    menuItems.map((item, index) => (
      <li
        key={index} // ✅ Always add a unique key
        className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition"
      >
        <span className="text-black font-bold">{item.icon}</span> {/* ✅ Moved className inside */}
        {item.text}
      </li>
    ))}
</ul>

      </div>

      {/* Overlay (Click to close menu) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;
