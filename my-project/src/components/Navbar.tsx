import { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHeart, FaTimes, FaEnvelope } from "react-icons/fa";
import { MdHotel, MdOutlineFlight } from "react-icons/md";
import { FaTaxi } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { BiMessageMinus } from "react-icons/bi";
import { loadHost } from "@/redux/thunks/hostTunk";
import { useDispatch } from "react-redux";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: 1, icon: <MdOutlineFlight size={22} className="text-black" />, text: "Flight", route: "/flights" },
    { id: 2, icon: <MdHotel size={22} className="text-black" />, text: "Stay", route: "/hotels" },
    { id: 3, icon: <FaEnvelope size={22} className="text-black" />, text: "Volunteering", route: "/volunteering-oppertunities" },
    { id: 4, icon: <FaTaxi size={22} className="text-black" />, text: "Plan Your Trip", route: "/trip-planning" },
    { id: 5, icon: <FaEnvelope size={22} className="text-black" />, text: "Contact", route: "/contact" },
  ];
  const dispatch=useDispatch<AppDispatch>()
  const { hostData, loading, error } = useSelector((state: RootState) => state.host);

  useEffect(() => {
    if (!hostData?.host) {
      dispatch(loadHost());
      console.log("host data fetching...");
    }
  }, [dispatch, hostData?.host]);
  
    

  const { volenteerData, isAuthenticated } = useSelector((state: RootState) => state.volenteer);


  const goToTheMessage = () => {
    navigate(`/message`);
  };
  const goToProfile = () => {
    setShowProfileMenu(false);
  
    if (hostData?.host?._id) {
      navigate(`/host/profile/${hostData.host._id}`);
    } else if (volenteerData?.user?.role === "volunteer") {
      navigate(`/volenteer/profile/${volenteerData.user._id}`);
    } else {
      navigate(`/user/profile/${volenteerData?.user?._id}`);
    }
  };
  

  const logOutHandler = () => {
    setShowProfileMenu(false);
    // add logout logic here if needed
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowFavorites(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Navbar */}
      <div className="h-20 w-full bg-gradient-to-b from-blue-100 to-blue-50 shadow-md py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GiHamburgerMenu
            size={30}
            className="cursor-pointer text-gray-700 hover:text-gray-900 transition"
            onClick={() => setIsOpen(true)}
          />
          <Link to={"/"}>
            <h5 className="text-3xl font-bold tracking-widest text-gray-900 uppercase cursor-default">
              <span className="bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">RAIH</span>
            </h5>
          </Link>
        </div>

        {/* Right side - Heart + Profile */}
        <div className="flex items-center gap-4 relative">
          {isAuthenticated || hostData ? (
            <>
              <button
                onClick={goToTheMessage}
                className="flex items-center justify-center p-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-md"
              >
                <BiMessageMinus size={20} />
              </button>

              <div className="relative">
                <img
                  src={"/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition-all"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                />

                {showProfileMenu && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-12 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transition-all duration-300 transform scale-100 opacity-100"
                  >
                    <div className="px-5 py-4 text-gray-800 font-semibold text-center bg-gray-100">
                    {hostData?.host?.firstName
  ? `${hostData.host.firstName} (Host)`
  : volenteerData?.user?.firstName || "Guest"}

                    </div>
                    <hr />
                    <button
                      className="w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-all"
                      onClick={goToProfile}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-5 py-3 text-red-500 hover:bg-gray-100 transition-all"
                      onClick={logOutHandler}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md">
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-100 to-blue-50 shadow-lg rounded-r-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-4 flex justify-end">
          <FaTimes
            size={24}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <ul className="px-6 py-4 text-gray-700 space-y-4">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setIsOpen(false)}
            >
              <Link to={item.route} className="flex items-center gap-3 w-full">
                <span className="text-black font-bold">{item.icon}</span>
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
