import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import Divider from "../Divider";
import Logo from "../Logo";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { addDetails } from "../../redux/hostFormSlice";

type UploadedImage = {
  file: File;
  preview: string;
  description: string;
};

const AddImage = () => {
  const dispatch = useDispatch<AppDispatch>();


  const submitDetails =()=>{
    console.log("aaadi g");
    
    dispatch(addDetails())
      .unwrap()
      .then((data) => {
        console.log("Details submitted:", data);
      })
      .catch((error) => {
        console.error("Submission error:", error);
      });

  }
  const [images, setImages] = useState<UploadedImage[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);

      if (selectedFiles.length < 1 && images.length + selectedFiles.length < 1) {
        toast.error("Please add at least three photos.");
        return;
      }

      const newImages = selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        description: "",
      }));

      setImages((prev) => [...prev, ...newImages]);
      toast.success("Files uploaded successfully!");
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, description } : img))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex w-full h-[100vh]">
      {/* LEFT */}
      <div className="hidden md:flex flex-col gap-y-4 w-1/3 h-full bg-black items-center justify-center">
        <Logo />
        <span className="text-xl font-semibold text-white">Welcome!</span>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-2/3 h-full bg-white md:px-20">
        <div className="w-full h-full flex flex-col items-center sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className="w-full md:w-[80%] lg:w-[90%] xl:w-[95%] flex flex-col">
            <form className="w-full space-y-6">
              <div className="flex flex-col rounded-md shadow-sm border border-black mt-5 p-5">
                <h1 className="ml-5 pb-4 text-lg font-semibold">
                  Add a minimum of three photos
                </h1>

                {/* File Upload */}
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

                {/* Display Uploaded Images */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative flex flex-col items-center">
                        {/* Image Preview */}
                        <img
                          src={image.preview}
                          alt="Uploaded Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        {/* Remove Image Button */}
                        <button
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          onClick={() => removeImage(index)}
                        >
                          <IoMdClose size={18} />
                        </button>
                        {/* Description Input */}
                        <input
                          type="text"
                          placeholder="Add description..."
                          value={image.description}
                          onChange={(e) =>
                            handleDescriptionChange(index, e.target.value)
                          }
                          className="mt-2 p-1 w-full border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Divider />

                {/* Buttons */}
                <div className="flex w-full justify-between py-3 px-4">
                  <button className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 transition">
                    Back
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      images.length >= 3
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-300 "
                    } transition`}
                   // disabled={images.length < 3}cursor-not-allowed
                   onClick={submitDetails}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default AddImage;