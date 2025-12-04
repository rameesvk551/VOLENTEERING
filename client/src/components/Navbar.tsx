import { useEffect, useRef, useState } from "react";
import { Menu, X, MessageCircle, ChevronDown, Compass, Home, Map, LogOut, User, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { loadHost } from "@/redux/thunks/hostTunk";
import axios from "axios";
import server from "@/server/app";
import toast from "react-hot-toast";
import { Button } from "./ui/button";

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { hostData } = useSelector((state: RootState) => state.host);
  const { volenteerData, isAuthenticated } = useSelector((state: RootState) => state.volenteer);

  const menuItems = [
    { 
      id: 1, 
      icon: <Home className="w-5 h-5" />, 
      text: "Stay", 
      route: "/hotels",
      description: "Find accommodations"
    },
    { 
      id: 2, 
      icon: <Compass className="w-5 h-5" />, 
      text: "Volunteering", 
      route: "/volunteering-oppertunities",
      description: "Discover opportunities"
    },
    { 
      id: 3, 
      icon: <Map className="w-5 h-5" />, 
      text: "Plan Your Trip", 
      route: "/trip-planning",
      description: "Create itineraries"
    },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!hostData?.host) {
      dispatch(loadHost());
    }
  }, [dispatch, hostData?.host]);

  const handleSigninbtn = () => {
    navigate("user/login");
  };

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

  const logOutHandler = async () => {
    setShowProfileMenu(false);
    try {
      let url = "";
      if (hostData?.host?._id) {
        url = `${server}/host/logout`;
      } else if (volenteerData?.user) {
        url = `${server}/user/logout`;
      } else {
        toast.error("User type not identified");
        return;
      }
      const res = await axios.post(url, {}, { withCredentials: true });
      if (res.data.success) {
        location.reload();
        toast.success("Logged out successfully");
      } else {
        toast.error("Something went wrong during logout");
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowProfileMenu(false);
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

  const userName = hostData?.host?.firstName
    ? `${hostData.host.firstName}`
    : volenteerData?.user?.firstName || "Guest";

  const userImage = hostData?.host?.profileImage || volenteerData?.user?.profileImage;

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section - Logo & Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="hidden sm:block text-xl font-bold text-gradient">
                  RAIH
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center ml-8 gap-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.route}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.text}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated || hostData ? (
                <>
                  {/* Message Button */}
                  <button
                    onClick={goToTheMessage}
                    className="relative p-2.5 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                    aria-label="Messages"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      2
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfileMenu((prev) => !prev)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={userImage || `https://ui-avatars.com/api/?name=${userName}&background=random`}
                        alt={userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-down">
                        {/* User Info */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{userName}</p>
                          <p className="text-sm text-gray-500">
                            {hostData?.host ? "Host Account" : "Volunteer"}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={goToProfile}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-5 h-5" />
                            <span>My Profile</span>
                          </button>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={logOutHandler}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("host/login")}
                    className="hidden sm:flex"
                  >
                    Become a Host
                  </Button>
                  <Button onClick={handleSigninbtn}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gradient">RAIH</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.route}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.text}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          {!isAuthenticated && !hostData && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  handleSigninbtn();
                }}
                className="w-full"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;
