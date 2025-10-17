import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faHeart, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";

const ProductPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">

      <div className="flex flex-col md:flex-row">
        {/* Product Image Gallery */}
      <ProductImageGallery/>

        {/* Product Info */}
        <div className="md:w-1/2 mt-6 md:mt-0 md:pl-10">
          <h2 className="text-3xl font-semibold text-gray-800">Product Title</h2>
          <p className="text-xl text-gray-600 mt-2">$199.99</p>
          <p className="text-gray-500 mt-4">This is a detailed description of the product. It highlights the key features, benefits, and any additional information that the user should know about the product. You can include bullet points here.</p>
          
          {/* Product Details */}
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-800">Services and Features</h3>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>Fast and Free Shipping</li>
              <li>30-Day Money-Back Guarantee</li>
              <li>24/7 Customer Support</li>
            </ul>
          </div>

          {/* Add to Cart / Favorite / Share Icons */}
          <div className="mt-6 flex gap-4">
            <button className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center gap-2">
              <FontAwesomeIcon icon={faCartPlus} />
              Add to Cart
            </button>
            <button className="bg-red-600 text-white py-2 px-4 rounded-md flex items-center gap-2">
              <FontAwesomeIcon icon={faHeart} />
              Favorite
            </button>
          </div>

          {/* Share Icons */}
          <div className="mt-4 flex gap-4 text-xl text-gray-700">
            <FontAwesomeIcon icon={faFacebookF} className="hover:text-blue-600 cursor-pointer" />
            <FontAwesomeIcon icon={faTwitter} className="hover:text-blue-400 cursor-pointer" />
            <FontAwesomeIcon icon={faInstagram} className="hover:text-pink-500 cursor-pointer" />
            <FontAwesomeIcon icon={faShareAlt} className="hover:text-gray-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

const ProductImageGallery = () => {
    const [mainImage, setMainImage] = useState("kasol.jpeg"); // Initial main image
  
    // Function to update the main image
    const handleThumbnailClick = (image: string) => {
      setMainImage(image);
    };
  
    return (
      <div className="md:w-1/2">
        {/* Main Image */}
        <div className="flex justify-center items-center">
          <img
            src={mainImage}
            alt="Product"
            className="rounded-lg shadow-lg w-full h-80 object-cover"
          />
        </div>
  
        {/* Thumbnail Gallery */}
        <div className="flex justify-center mt-4 space-x-4">
          {/* Thumbnail images */}
          <img
            src="kasol.jpeg"
            alt="Kasol"
            className="w-20 h-20 object-cover cursor-pointer rounded-lg"
            onClick={() => handleThumbnailClick("kasol.jpeg")}
          />
          <img
            src="manali.jpeg"
            alt="Manali"
            className="w-20 h-20 object-cover cursor-pointer rounded-lg"
            onClick={() => handleThumbnailClick("manali.jpeg")}
          />
          <img
            src="delhi.jpeg"
            alt="Delhi"
            className="w-20 h-20 object-cover cursor-pointer rounded-lg"
            onClick={() => handleThumbnailClick("delhi.jpeg")}
          />
        </div>
      </div>
    );
  };