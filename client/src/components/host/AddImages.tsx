import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import Divider from "../Divider";
import Logo from "../Logo";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { addImages, removeImage, resetForm, updateImageDescription } from "../../redux/Slices/hostFormSlice";
import axios from "axios";
import server from "../../server/app";
import { useNavigate } from "react-router-dom";

type UploadedImage = {
  file: File;
  preview: string;
  description: string;
};

const AddImage = () => {
  const navigate=useNavigate()
  const [isSubmitingDetails,setIsSubmitingDetails]=useState<boolean>(false)
  const dispatch = useDispatch<AppDispatch>();
  const images = useSelector((state: RootState) => state.hostForm.data.images);
  const allData = useSelector((state: RootState) => state.hostForm.data);

  const uploadToCloudinary = async (file: File) => {
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
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return null;
    }
  };
  

  const handleSubmit = async () => {

    setIsSubmitingDetails(true)
    try {
      const uploadedImageUrls = await Promise.all(
        images.map(image => uploadToCloudinary(image.file)) // ✅ Pass `image.file`
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
  
      const response = await axios.post(`${server}/host/add-details`, requestBody,{withCredentials:true});


      dispatch(resetForm());
      toast.success("details uploaded successfully!");
      navigate(`/preview/${response.data.host._id}`)
     
    } catch (error) {
      console.error("Error sending images to backend:", error);
      toast.error("Failed to upload images.");
    }
  };
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleDescriptionChange = (index: number, description: string) => {
    dispatch(updateImageDescription({ index, description }));
  };

  const handleRemoveImage = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // ✅ Prevent button from triggering form submission
    dispatch(removeImage(index));
  };
  

  return (
    <div className="flex w-full h-[100vh]">
      <div className="hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center">
        <Logo />
        <span className="text-xl font-semibold text-white">Welcome!</span>
      </div>

      {
        isSubmitingDetails ?
        (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
  </div>
  <h1 className="text-lg font-semibold text-gray-700 text-center">
    Submitting... <br />
    Uploading photos takes some time
  </h1>
</div>

        ):(
          <div className="flex w-full md:w-2/3 h-full bg-white md:px-20">
        <div className="w-full h-full flex flex-col items-center sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className="w-full md:w-[80%] lg:w-[90%] xl:w-[95%] flex flex-col">
            <form className="w-full space-y-6">
              <div className="flex flex-col rounded-md shadow-sm border border-black mt-5 p-5">
                <h1 className="ml-5 pb-4 text-lg font-semibold">Add a minimum of three photos</h1>
                <div className="flex flex-col w-full items-center justify-center h-[200px] bg-blue-300 rounded-lg">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 transition cursor-pointer"
                  >
                    <IoIosAddCircleOutline size={30} />
                    Add files
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative flex flex-col items-center">
                        <img
                          src={image.preview}
                          alt="Uploaded Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      <button
  type="button" 
  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
  onClick={(e) => handleRemoveImage(index, e)}
>
                          <IoMdClose size={18} />
                        </button>
                        <input
                          type="text"
                          placeholder="Add description..."
                          value={image.description}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          className="mt-2 p-1 w-full border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Divider />
                <div className="flex w-full justify-between py-3 px-4">
                  <button className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 transition">Back</button>
                  <button
  type="button" // ✅ Prevent default form submission
  className={`px-4 py-2 rounded ${images.length >= 3 ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed"} transition`}
  disabled={images.length < 3}
  onClick={handleSubmit}
>
  Continue
</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
        )
      }

      <Toaster richColors />
    </div>
  );
};

export default AddImage;
