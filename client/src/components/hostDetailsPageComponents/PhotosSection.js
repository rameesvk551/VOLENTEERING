import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PhotosSection = ({ images }) => {
    return (_jsx("div", { className: "grid grid-cols-3 gap-4 max-w-4xl mx-auto p-4", children: images?.map((image) => (_jsxs("div", { className: "bg-white p-2 rounded-lg shadow-md", children: [_jsx("img", { src: image.url, alt: image.description, className: "w-full h-40 object-cover rounded-lg" }), _jsx("p", { className: "text-center text-gray-700 mt-2", children: image.description })] }, image._id))) }));
};
export default PhotosSection;
