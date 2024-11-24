import React, { useState, useEffect,useRef } from "react";
import { useAuth } from "@/utils/AuthContext";
import Image from "next/image";
import { uploadFile } from "@/utils/uploadUtils";

const UserEditForm = ({ userId, onSuccess, isProfileEdit = false }) => {
  const { user, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
      });

      // Improved avatar URL handling
      if (user.avatar?.url) {
        const avatarUrl = getFullAvatarUrl(user.avatar.url);
        setPreviewUrl(avatarUrl);
      }
    }
  }, [user]);

  // Helper function to get full avatar URL
  const getFullAvatarUrl = (url) => {
    if (!url) return "";

    // Check if it's already a full URL
    if (url.startsWith("http")) {
      return url;
    }

    // Check if it's a relative URL starting with "/"
    if (url.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${url}`;
    }

    // If it doesn't start with "/", add it
    return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/${url}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and GIF files are allowed");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);

    try {
      let avatarId = null;

      if (formData.avatar) {
        try {
          const uploadedFile = await uploadFile({
            file: formData.avatar,
            onProgress: setUploadProgress,
          });

          if (!uploadedFile?.id) {
            throw new Error("Failed to get avatar ID from upload response");
          }

          avatarId = uploadedFile.id;
        } catch (uploadError) {
          if (uploadError.message.includes("Authentication") ||
            uploadError.response?.status === 401) {
            logout();
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }
      }

      const updateData = {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        ...(avatarId && { avatar: avatarId }),
      };

      const updatedUser = await updateUser(updateData);
      setSuccess("Profile updated successfully");
      if (onSuccess) onSuccess(updatedUser);

    } catch (error) {
      const errorMessage = error.response?.data?.error?.message ||
        error.message ||
        "Failed to update profile";
      setError(errorMessage);

      if (error.response?.status === 401) {
        logout();
        setError("Your session has expired. Please log in again.");
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!user) {
    return <div>Please log in to edit your profile.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg" role="alert">
          {success}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="space-y-2">

        <div className="mt-2 flex items-center justify-center">
          <div
            className="relative w-24 h-24 cursor-pointer transition-transform hover:scale-105"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            aria-label="Click to change avatar"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                fill
                sizes="96px"
                className="rounded-full object-cover"
                priority
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* Username Field */}
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          minLength={3}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 text-white bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500">Minimum 3 characters</p>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 text-white bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          minLength={6}
          placeholder="Leave blank to keep current password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 text-white bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500">Minimum 6 characters</p>
      </div>


        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Updating...
          </span>
        ) : (
          "Update Profile"
        )}
      </button>
    </form>
  );
};

export default UserEditForm;