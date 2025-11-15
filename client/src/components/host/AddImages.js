import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import Divider from "../Divider";
import Logo from "../Logo";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { addImages, removeImage, resetForm, updateImageDescription } from "../../redux/Slices/hostFormSlice";
import axios from "axios";
import server from "../../server/app";
import { useNavigate } from "react-router-dom";
const AddImage = () => {
    const navigate = useNavigate();
    const [isSubmitingDetails, setIsSubmitingDetails] = useState(false);
    const dispatch = useDispatch();
    const images = useSelector((state) => state.hostForm.data.images);
    const allData = useSelector((state) => state.hostForm.data);
    const uploadToCloudinary = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "unsigned_upload");
            const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/djruimp0d/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await cloudinaryResponse.json();
            return data.secure_url || null;
        }
        catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            return null;
        }
    };
    const handleSubmit = async () => {
        setIsSubmitingDetails(true);
        try {
            const uploadedImageUrls = await Promise.all(images.map(image => uploadToCloudinary(image.file)) // ✅ Pass `image.file`
            );
            console.log("Uploaded Image URLs:", uploadedImageUrls);
            const requestBody = {
                ...allData,
                images: uploadedImageUrls
                    .filter(url => url !== null)
                    .map((url, index) => ({
                    url,
                    description: images[index].description || "",
                })),
            };
            const response = await axios.post(`${server}/host/add-details`, requestBody, { withCredentials: true });
            dispatch(resetForm());
            toast.success("details uploaded successfully!");
            navigate(`/preview/${response.data.host._id}`);
        }
        catch (error) {
            console.error("Error sending images to backend:", error);
            toast.error("Failed to upload images.");
        }
    };
    const handleFileChange = (event) => {
        if (event.target.files) {
            const selectedFiles = Array.from(event.target.files);
            const newImages = selectedFiles.map((file) => {
                const previewUrl = URL.createObjectURL(file);
                return { file, preview: previewUrl, description: "" };
            });
            dispatch(addImages(newImages));
            // Cleanup object URLs when the component unmounts
            newImages.forEach(image => {
                setTimeout(() => URL.revokeObjectURL(image.preview), 5000);
            });
        }
    };
    const handleDescriptionChange = (index, description) => {
        dispatch(updateImageDescription({ index, description }));
    };
    const handleRemoveImage = (index, event) => {
        event.preventDefault(); // ✅ Prevent button from triggering form submission
        dispatch(removeImage(index));
    };
    return (_jsxs("div", { className: "flex w-full h-[100vh]", children: [_jsxs("div", { className: "hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center", children: [_jsx(Logo, {}), _jsx("span", { className: "text-xl font-semibold text-white", children: "Welcome!" })] }), isSubmitingDetails ?
                (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-4", children: [_jsx("div", { className: "relative w-12 h-12", children: _jsx("div", { className: "absolute inset-0 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" }) }), _jsxs("h1", { className: "text-lg font-semibold text-gray-700 text-center", children: ["Submitting... ", _jsx("br", {}), "Uploading photos takes some time"] })] })) : (_jsx("div", { className: "flex w-full md:w-2/3 h-full bg-white md:px-20", children: _jsxs("div", { className: "w-full h-full flex flex-col items-center sm:px-0 lg:px-8", children: [_jsx("div", { className: "block mb-10 md:hidden -ml-8", children: _jsx(Logo, {}) }), _jsx("div", { className: "w-full md:w-[80%] lg:w-[90%] xl:w-[95%] flex flex-col", children: _jsx("form", { className: "w-full space-y-6", children: _jsxs("div", { className: "flex flex-col rounded-md shadow-sm border border-black mt-5 p-5", children: [_jsx("h1", { className: "ml-5 pb-4 text-lg font-semibold", children: "Add a minimum of three photos" }), _jsxs("div", { className: "flex flex-col w-full items-center justify-center h-[200px] bg-blue-300 rounded-lg", children: [_jsxs("label", { htmlFor: "file-upload", className: "flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 transition cursor-pointer", children: [_jsx(IoIosAddCircleOutline, { size: 30 }), "Add files"] }), _jsx("input", { id: "file-upload", type: "file", className: "hidden", multiple: true, accept: "image/*", onChange: handleFileChange })] }), images.length > 0 && (_jsx("div", { className: "mt-4 grid grid-cols-2 md:grid-cols-3 gap-4", children: images.map((image, index) => (_jsxs("div", { className: "relative flex flex-col items-center", children: [_jsx("img", { src: image.preview, alt: "Uploaded Preview", className: "w-32 h-32 object-cover rounded-lg border border-gray-300" }), _jsx("button", { type: "button", className: "absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600", onClick: (e) => handleRemoveImage(index, e), children: _jsx(IoMdClose, { size: 18 }) }), _jsx("input", { type: "text", placeholder: "Add description...", value: image.description, onChange: (e) => handleDescriptionChange(index, e.target.value), className: "mt-2 p-1 w-full border border-gray-300 rounded-md text-sm" })] }, index))) })), _jsx(Divider, {}), _jsxs("div", { className: "flex w-full justify-between py-3 px-4", children: [_jsx("button", { className: "px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 transition", children: "Back" }), _jsx("button", { type: "button" // ✅ Prevent default form submission
                                                    , className: `px-4 py-2 rounded ${images.length >= 3 ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"} transition`, disabled: images.length < 3, onClick: handleSubmit, children: "Continue" })] })] }) }) })] }) })), _jsx(Toaster, { richColors: true })] }));
};
export default AddImage;
