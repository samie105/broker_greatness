"use client";
import axios from "axios";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUserData } from "../../../contexts/userrContext";
import { InfinitySpin } from "react-loader-spinner";

export default function Verify() {
  const { email } = useUserData();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    country: "",
    zipCode: "",
  });
  const [loading, isloading] = useState(false);
  const [isUploadingFront, setIsUploadingFront] = useState(false);
  const [isUploadingBack, setIsUploadingBack] = useState(false);
  const [frontIDFile, setFrontIDFile] = useState(null);
  const [backIDFile, setBackIDFile] = useState(null);

  const [frontIDSecureUrl, setFrontIDSecureUrl] = useState(null); // Add this line
  const [backIDSecureUrl, setBackIDSecureUrl] = useState(null); // Add this line  const [formErrors, setFormErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const onDropFront = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploadingFront(true); // Set the loading state
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dgqjunu7l/upload`,
          formData
        );

        if (response.status === 200) {
          setFrontIDFile(file);
          setFrontIDSecureUrl(response.data.secure_url); // Update the Cloudinary secure URL
        } else {
          console.error("Failed to upload image to Cloudinary");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploadingFront(false); // Reset the loading state
      }
    }
  };

  const onDropBack = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploadingBack(true); // Set the loading state
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dgqjunu7l/upload`,
          formData
        );

        if (response.status === 200) {
          setBackIDFile(file);
          setBackIDSecureUrl(response.data.secure_url); // Update the Cloudinary secure URL
        } else {
          console.error("Failed to upload image to Cloudinary");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploadingBack(false); // Reset the loading state
      }
    }
  };

  const {
    getRootProps: getRootPropsFront,
    getInputProps: getInputPropsFront,
    isDragActive: isDragActiveFront,
  } = useDropzone({
    onDrop: onDropFront,
    accept: "image/jpeg, image/png, image/gif",
    maxFiles: 1,
  });

  const {
    getRootProps: getRootPropsBack,
    getInputProps: getInputPropsBack,
    isDragActive: isDragActiveBack,
  } = useDropzone({
    onDrop: onDropBack,
    accept: "image/jpeg, image/png, image/gif",
    maxFiles: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    for (const key in formData) {
      if (!formData[key] && key !== "addressLine2") {
        // Make addressLine2 optional
        errors[key] = "This field is required";
      }
    }
    if (!frontIDSecureUrl) {
      errors.frontID = "Front ID image is required";
    }
    if (!backIDSecureUrl) {
      errors.backID = "Back ID image is required";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      isloading(true);
      try {
        const response = await axios.post("/dashboard/verifyid/api", {
          formData: formData,
          frontIDSecureUrl,
          backIDSecureUrl,
          email,
        });

        if (response.status === 200) {
          console.log("Form submitted successfully to backend.");
          isloading(false);
          setFormData({
            firstName: "",
            lastName: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            stateProvince: "",
            country: "",
            zipCode: "",
          });

          // Clear file inputs
          setFrontIDFile(null);
          setBackIDFile(null);

          // Clear Cloudinary secure URLs
          setFrontIDSecureUrl(null);
          setBackIDSecureUrl(null);
        } else {
          console.error("Failed to submit form to backend.");
          isloading(false);
        }
      } catch (error) {
        console.error("Error submitting form to backend:", error);
      }
    }
    isloading(false);
  };

  return (
    <div className="p-4">
      <div className="p-4 rounded-md border /shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
        <div className="mb-4 py-3">
          <div className="flex items-center mb-4">
            <div className="text-xl font-bold">ID Verification</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 ml-2 text-green-600"
            >
              <path
                fillRule="evenodd"
                d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="font-bold text-sm">
            Your Personal info/ID for verification will be processed and
            verified
          </p>
        </div>

        <form onSubmit={handleSubmit} className="">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label
                  key={key}
                  htmlFor={key}
                  className="block mt-4 font-bold text-sm mb-3"
                >
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={formData[key]}
                  placeholder={`Enter ${key
                    .replace(/([A-Z])/g, " $1")
                    .toLowerCase()}`}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-xs rounded-lg bg-gray-50 font-bold focus:outline-none border ${
                    formErrors[key]
                      ? "border-red-500"
                      : "focus:border-slate-500"
                  }`}
                />
                {formErrors[key] && (
                  <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Dropzone for Front ID */}
          <label
            htmlFor="frontID"
            className="block my-4 mb-2 text-sm font-bold pt-4"
          >
            Verification ID (Front)
          </label>
          <div
            {...getRootPropsFront()}
            className={`w-full px-4 py-3 text-sm rounded-lg bg-gray-50 font-bold border focus:outline-none ${
              isDragActiveFront ? "border-slate-500" : ""
            } ${formErrors.frontID ? "border-red-500" : ""}`}
          >
            <input {...getInputPropsFront()} />
            {isUploadingFront ? (
              <p>Uploading Front ID image...</p>
            ) : frontIDFile ? (
              <p>{frontIDFile.name}</p>
            ) : (
              <p>No file chosen</p>
            )}
          </div>
          {formErrors.frontID && (
            <p className="text-red-500 text-xs mt-1">{formErrors.frontID}</p>
          )}
          <label htmlFor="backID" className="block my-4 pt-2 text-sm font-bold">
            Verification ID (Back)
          </label>
          <div
            {...getRootPropsBack()}
            className={`w-full px-4 py-3 text-sm rounded-lg bg-gray-50 font-bold border focus:outline-none ${
              isDragActiveBack ? "border-slate-500" : ""
            } ${formErrors.backID ? "border-red-500" : ""}`}
          >
            <input {...getInputPropsBack()} />
            {isUploadingBack ? (
              <p>Uploading Back ID image...</p>
            ) : backIDFile ? (
              <p>{backIDFile.name}</p>
            ) : (
              <p>No file chosen</p>
            )}
          </div>
          {formErrors.backID && (
            <p className="text-red-500 text-xs mt-1">{formErrors.backID}</p>
          )}

          <button
            type="submit"
            className="w-full px-4 mt-4 flex justify-center items-center text-sm rounded-lg bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-red-800 via-red-600 to-orange-500 my-3 text-white font-bold  focus:outline-none "
          >
            {loading ? (
              <InfinitySpin width="100" color="#ffffff" />
            ) : (
              <div className="py-3">Submit Verification</div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
