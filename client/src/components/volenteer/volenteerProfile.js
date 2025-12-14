import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { MdRestore } from "react-icons/md";
import Divider from "../Divider";
import { TbFileDescription } from "react-icons/tb";
import { IoMdHeart } from "react-icons/io";
import { useSelector } from "react-redux";
import { CiEdit } from "react-icons/ci";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import server from "../../server/app";
import Review from "./Review";
const volenteerProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { volenteerData } = useSelector((state) => state.volenteer);
    const [isMembershipOpen, setIsMembershipOpen] = useState();
    const [addIntrestedActivities, setAddIntrestedActivities] = useState(false);
    const [editTravelStatus, setEditTravelStatus] = useState(false);
    const [travelStatus, setTravelStatus] = useState("Home");
    const [editSkills, setEditSkills] = useState(false);
    const [editAge, setEditAge] = useState(false);
    const [isSmoker, setIsSmoker] = useState(false);
    const [birthDate, setBirthDate] = useState("");
    const [active, setActive] = useState(1);
    const [age, setAge] = useState(0);
    const [image, setImage] = useState("/default-avatar.png");
    const [activities, setActivities] = useState(volenteerData?.user?.activities || []);
    const [newActivity, setNewActivity] = useState("");
    const [skills, setSkills] = useState(volenteerData?.user?.kills || []);
    const [newSkill, setNewSkill] = useState("");
    const [loading, setLoading] = useState(false);
    const [editnextDestination, setEditnextDestination] = useState(false);
    const [destination, setDestination] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [addSkills, setAddSkills] = useState(false);
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
            setIsImageUploading(true);
            const formData = new FormData();
            formData.append("profileImage", file);
            try {
                const response = await axios.put(`${server}/user/update-profile`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
                console.log("Uploaded Image URL:", response.data.imageUrl);
            }
            catch (error) {
                console.error("Upload failed:", error);
            }
            finally {
                setIsImageUploading(false);
            }
        }
    };
    const handleUpdateNextDestination = async () => {
        try {
            setLoading(true);
            await axios.put(`${server}/user/update-details`, { nextDestination: {
                    destination: destination,
                    fromDate: fromDate,
                    toDate: toDate,
                }
            }, { withCredentials: true });
            // optionally show a success toast
            setEditTravelStatus(false);
        }
        catch (err) {
            console.error(err);
            // optionally show an error toast
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const response = await axios.get(`${server}/user/get-reviews`, {
                    withCredentials: true,
                });
                console.log("tttttttttrs active", response);
                setReviews(response.data.reviews);
            }
            catch (err) {
                console.error("Error fetching reviews:", err);
            }
            finally {
                setLoadingReviews(false);
            }
        };
        if (active === 2 && reviews.length === 0) {
            fetchReviews();
        }
    }, [active]);
    const handleAddItem = async (type, value, setState, state, setInput) => {
        const trimmed = value.trim();
        if (!trimmed)
            return;
        const updatedList = [...state, trimmed];
        setLoading(true);
        try {
            await axios.put(`${server}/user/update-details`, {
                [type]: updatedList,
            }, { withCredentials: true });
            setState(updatedList);
            setInput(""); // reset input field
        }
        catch (err) {
            console.error(`Failed to update ${type}:`, err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemoveItem = async (type, indexToRemove, state, setState) => {
        const updatedList = state.filter((_, idx) => idx !== indexToRemove);
        try {
            await axios.put(`${server}/user/update-details`, {
                [type]: updatedList,
            }, { withCredentials: true });
            setState(updatedList);
        }
        catch (err) {
            console.error(`Failed to remove ${type}:`, err);
        }
    };
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };
    const tabs = [
        { id: 1, label: "OVERVIEW" },
        { id: 2, label: `FEEDBACK(${volenteerData?.user?.reviews.length})` },
    ];
    const ishaveMembership = volenteerData?.user?.status === "active";
    console.log("activities", volenteerData?.user);
    return (_jsxs("div", { className: "flex flex-col bg-[#f5f5f5] ", children: [_jsxs("div", { className: "bg-[#fff]   ", children: [_jsxs("div", { className: "flex flex-row pl-10 pt-4 gap-3", children: [_jsxs("div", { className: "relative w-32 h-32", children: [_jsxs("label", { htmlFor: "profileUpload", className: "cursor-pointer", children: [_jsx("img", { src: volenteerData?.user?.profileImage, alt: "Profile", className: `w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-md ${isImageUploading && "opacity-50"}` }), isImageUploading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full", children: _jsxs("svg", { className: "animate-spin h-6 w-6 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v8z" })] }) }))] }), _jsx("input", { type: "file", id: "profileUpload", accept: "image/*", className: "hidden", onChange: handleImageChange })] }), _jsxs("div", { className: "", children: [_jsx("div", { children: _jsxs("h1", { className: "text-[#0a3f5f] text-[27px] font-bold my-[5px] mb-[15px] mt-6", children: [volenteerData?.user?.firstName, "    ", volenteerData?.user?.lastName] }) }), _jsxs("div", { className: "flex flex-row gap-2 ", children: [_jsxs("div", { className: "flex ", children: [_jsx(IoMdHeart, { size: 25 }), _jsx("span", { children: "Favourited 0 times" })] }), _jsxs("div", { className: "flex ", children: [_jsx(MdRestore, { size: 25 }), "   ", _jsxs("span", { children: ["Last login:", formatDate(volenteerData?.user?.lastLogin), " "] })] })] })] })] }), _jsx(Divider, {}), _jsx("div", { className: "flex justify-between pl-[100px] pr-[160px] text-[#0a3f5f] text-[20px] pt-4 pb-5", children: _jsx("div", { className: "flex justify-center space-x-10  pb-2  flex items-center ", children: tabs && tabs.map((tab) => (_jsx("div", { className: "relative cursor-pointer", children: _jsx("h5", { onClick: () => setActive(tab.id), className: `pb-2 ${active === tab.id ? "font-bold text-crimson" : "text-gray-600"}`, children: tab.label }) }, tab.id))) }) })] }), active === 2 &&
                _jsx("div", { className: "flex flex-col items-center gap-3 mt-4", children: reviews && reviews.map((review) => {
                        return (_jsx(Review, { rating: review.rating, comment: review.comment, date: review.date, hostName: review.reviewerName }, review.id));
                    }) }), active === 1 &&
                _jsx("div", { className: "px-[100px] flex flex-row  mt-8 gap-7", children: _jsxs("div", { className: "w-2/3  ", children: [_jsxs("div", { className: "w-80% p-6  bg-[#fff] ", children: [_jsx("h1", { className: "text-[#666] text-[25px] font-bold", children: "My Status" }), _jsxs("div", { className: "w-full pl-4", children: [_jsx(TbFileDescription, {}), _jsx("h2", { className: " text-[#b4cb3c] text-[1.1rem]", children: "Travelling Information" }), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "font-bold", children: "I'm currently" }), editTravelStatus ? (_jsxs("select", { className: "border border-black w-[455px] h-8 pt-1", value: travelStatus, onChange: (e) => setTravelStatus(e.target.value), children: [_jsx("option", { value: "Home", children: "Home" }), _jsx("option", { value: "Travelling", children: "Travelling" })] })) : (_jsx("h2", { children: volenteerData?.user?.travelStatus }))] }), _jsxs("button", { className: "bg-green-400 rounded-md flex items-center px-3 h-5", onClick: () => setEditTravelStatus(!editTravelStatus), children: [_jsx(CiEdit, {}), "Edit"] })] }), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "font-bold", children: "Let other travellers know the activities you\u2019re interested in:" }), !addIntrestedActivities && (_jsx("div", { className: "flex gap-2 flex-wrap mt-2", children: volenteerData?.user?.activities?.length > 0 ? (volenteerData.user.activities.map((activity, index) => (_jsx("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm", children: activity }, index)))) : (_jsx("p", { className: "text-gray-500 text-sm", children: "No activities added yet." })) }))] }), _jsxs("button", { className: "bg-green-400 rounded-md flex items-center px-3 h-5", onClick: () => setAddIntrestedActivities(!addIntrestedActivities), children: [_jsx(CiEdit, {}), _jsx("span", { className: "ml-1 text-sm", children: addIntrestedActivities ? "Close" : "Edit" })] })] }), addIntrestedActivities && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("input", { type: "text", value: newActivity, onChange: (e) => setNewActivity(e.target.value), className: "border border-black w-2/3 px-2 py-1", placeholder: "Enter new activity", disabled: loading }), _jsx("button", { onClick: () => handleAddItem("activities", newActivity, setActivities, activities, setNewActivity), className: "bg-green-500 text-white px-3 py-1 rounded", disabled: loading, children: loading ? "Adding..." : "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: volenteerData?.user?.activities?.map((interest, i) => (_jsxs("span", { className: "bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1", children: [interest, _jsx("button", { type: "button", onClick: () => handleRemoveItem("activities", i, activities, setActivities), className: "ml-1 text-black hover:text-red-600", children: "\u00D7" })] }, i))) })] })), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "font-bold", children: "My next destinations" }), !editnextDestination ? (_jsx(_Fragment, { children: _jsxs("h1", { children: [destination, " - from ", fromDate, " until ", toDate] }) })) : (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", value: destination, onChange: (e) => setDestination(e.target.value), placeholder: "Enter destination", className: "border px-2 py-1 mt-1 w-full" }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsx("input", { type: "month", value: fromDate, onChange: (e) => setFromDate(e.target.value), className: "border px-2 py-1" }), _jsx("input", { type: "month", value: toDate, onChange: (e) => setToDate(e.target.value), className: "border px-2 py-1" })] }), _jsx("button", { onClick: handleUpdateNextDestination, className: "bg-green-600 text-white rounded mt-2 px-3 py-1 w-fit", disabled: loading, children: loading ? "Saving..." : "Save" })] }))] }), _jsxs("button", { className: "bg-green-400 rounded-md flex items-center px-3 h-5", onClick: () => setEditnextDestination(!editnextDestination), children: [_jsx(CiEdit, {}), _jsx("span", { className: "ml-1 text-sm", children: editnextDestination ? "Close" : "Edit" })] })] }), _jsx(Divider, {})] })] }), _jsxs("div", { className: "w-80% p-6  bg-[#fff] mt-5", children: [_jsx("h1", { className: "text-[#666] text-[25px] font-bold", children: "Profile Information" }), ishaveMembership ? (_jsx("div", { className: "flex justify-between pt-3", children: _jsxs("button", { className: "bg-green-200 rounded-md  flex items-center px-3", children: [" ", "Individual Account"] }) })) : (_jsxs("div", { className: "flex justify-between pt-3", children: [_jsx("h1", { className: " text-[#b4cb3c] text-[1.1rem]", children: "Not a Member of community" }), _jsxs("button", { className: "bg-green-200 rounded-md  flex items-center px-3", onClick: () => {
                                                    setEditSkills(!editSkills);
                                                }, children: [" ", "Become a member"] })] })), _jsx(Divider, {}), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between pt-3", children: [_jsx("h1", { className: " text-[#b4cb3c] text-[1.1rem]", children: "Description" }), _jsxs("button", { className: "bg-green-400 rounded-md flex items-center px-3 h-5", onClick: () => setEditTravelStatus(!editTravelStatus), children: [_jsx(CiEdit, {}), "Edit"] })] }), _jsx("p", { children: volenteerData?.user?.description })] }), _jsx(Divider, {}), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "font-bold", children: "What skills you have" }), !addIntrestedActivities && (_jsx("div", { className: "flex gap-2 flex-wrap mt-2", children: volenteerData?.user?.user?.skills?.length > 0 ? (volenteerData.user.user.skills.map((skill, index) => (_jsx("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm", children: skill }, index)))) : (_jsx("p", { className: "text-gray-500 text-sm", children: "No activities added yet." })) }))] }), _jsxs("button", { className: "bg-green-400 rounded-md flex items-center px-3 h-5", onClick: () => setAddSkills(!addSkills), children: [_jsx(CiEdit, {}), _jsx("span", { className: "ml-1 text-sm", children: addSkills ? "Close" : "Edit" })] })] }), addSkills && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("input", { type: "text", value: newActivity, onChange: (e) => setNewActivity(e.target.value), className: "border border-black w-2/3 px-2 py-1", placeholder: "Enter new activity", disabled: loading }), _jsx("button", { onClick: () => handleAddItem("skills", newSkill, setSkills, skills, setNewSkill), className: "bg-green-500 text-white px-3 py-1 rounded", disabled: loading, children: loading ? "Adding..." : "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: volenteerData?.user?.activities?.map((interest, i) => (_jsxs("span", { className: "bg-[#b4cb3c] text-black px-3 py-1 rounded-full text-sm flex items-center gap-1", children: [interest, _jsx("button", { type: "button", onClick: () => handleRemoveItem("skills", i, skills, setSkills), className: "ml-1 text-black hover:text-red-600", children: "\u00D7" })] }, i))) })] })), _jsx(Divider, {}), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("div", { className: "flex justify-between pt-3", children: _jsx("h1", { className: "text-[#b4cb3c] text-[1.1rem]", children: "Date of Birth" }) }), _jsx("h1", { children: volenteerData?.user?.birthDate })] }), _jsx(Divider, {})] })] }) })] }));
};
export default volenteerProfile;
