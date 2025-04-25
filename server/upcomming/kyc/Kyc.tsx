import React, { useState } from "react";
import { motion } from "framer-motion";
import WebcamSelfie from "./WebCamSelfie";
import server from "@/server/app";
import axios from "axios";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    idType: "",
  });

  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
  
  });
  const [selfie, setSelfie] = useState<string | null>(null);

  

  const [errors, setErrors] = useState<string[]>([]);
  const handleCapture = (imageData: string) => {
    console.log("Captured in parent:", imageData);
    setSelfie(imageData); // Store or upload as needed
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];

      // Basic file validation
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB.");
        return;
      }

      setFiles((prev) => ({ ...prev, [name]: file }));
    }
  };

  const validate = () => {
    const newErrors: string[] = [];
    const { fullName, dob, idType } = formData;
    const { idFront, idBack } = files;

    // Name validation
    if (!fullName.trim() || fullName.length < 3) {
      newErrors.push("Full name must be at least 3 characters.");
    }

    // DOB check – must be 18+
    if (!dob) {
      newErrors.push("Date of birth is required.");
    } else {
      const dobDate = new Date(dob);
      const age = new Date().getFullYear() - dobDate.getFullYear();
      if (age < 18) {
        newErrors.push("You must be at least 18 years old.");
      }
    }

    if (!idType) newErrors.push("ID type is required.");
    if (!idFront) newErrors.push("Front side of ID is missing.");
    if (!idBack) newErrors.push("Back side of ID is missing.");
    if (!selfie) newErrors.push("Selfie is missing.");

    return newErrors;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
  
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setErrors([]);
    console.log("Submitting KYC:", formData, files, selfie);
  
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("dob", formData.dob);
      data.append("idType", formData.idType);
  
      if (files.idFront) data.append("idFront", files.idFront);
      if (files.idBack) data.append("idBack", files.idBack);
  
      if (selfie) {
        // Convert base64 string to Blob for FormData
        const blob = await (await fetch(selfie)).blob();
        const selfieFile = new File([blob], "selfie.png", { type: "image/png" });
        data.append("selfie", selfieFile);
      }
  console.log(
    'fffffform dataaaa',formData,selfie
  );
  
      const response = await axios.post(`${server}/kyc/submit-kyc`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // ✅ this is outside of headers
      });
      
      alert("KYC submitted successfully!");
    } catch (err: any) {
      console.error("Error submitting KYC:", err);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-blue-50">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        {/* Left Side - Form Fields */}
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-blue-900 text-center">🔐 KYC Verification</h2>

          {errors.length > 0 && (
            <ul className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl space-y-1 text-sm">
              {errors.map((err, idx) => (
                <li key={idx}>• {err}</li>
              ))}
            </ul>
          )}

          <div>
            <label className="block text-sm font-semibold text-blue-800">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="mt-1 w-full rounded-xl border-none shadow-inner bg-white/90 focus:ring-2 focus:ring-blue-300 px-4 py-3 text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-800">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border-none shadow-inner bg-white/90 focus:ring-2 focus:ring-blue-300 px-4 py-3 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-800">ID Type</label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border-none shadow-inner bg-white/90 focus:ring-2 focus:ring-blue-300 px-4 py-3 text-gray-800"
              required
            >
              <option value="">Select ID Type</option>
              <option value="aadhar">Aadhar</option>
              <option value="passport">Passport</option>
              <option value="driving">Driving License</option>
            </select>
          </div>
        </div>

        {/* Right Side - Uploads + Selfie */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-800">ID Front</label>
              <input
                type="file"
                name="idFront"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-200 file:text-blue-900 hover:file:bg-blue-300 transition"
              />
              {files.idFront && (
                <img
                  src={URL.createObjectURL(files.idFront)}
                  alt="ID Front Preview"
                  className="rounded-xl w-full h-24 object-cover shadow-md"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-800">ID Back</label>
              <input
                type="file"
                name="idBack"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-200 file:text-blue-900 hover:file:bg-blue-300 transition"
              />
              {files.idBack && (
                <img
                  src={URL.createObjectURL(files.idBack)}
                  alt="ID Back Preview"
                  className="rounded-xl w-full h-24 object-cover shadow-md"
                />
              )}
            </div>
          </div>

          {/* Webcam Selfie Component */}
          <div className="pt-4">
          <WebcamSelfie onCapture={handleCapture} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-semibold py-3 rounded-2xl shadow-md hover:shadow-lg transition"
          >
            🚀 Submit for Verification
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default KYCForm;
