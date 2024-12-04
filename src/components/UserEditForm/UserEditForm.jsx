import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/utils/AuthContext";
import Image from "next/image";
import { useRouter } from "next/router";
import { uploadFile } from "@/utils/uploadUtils";
import { Camera, Upload, Maximize2, X ,Eye,EyeOff} from "lucide-react";


const UserEditForm = ({ userId, onSuccess, isProfileEdit = false }) => {
  const router = useRouter(); // Add router hook
  const { user, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Add handler for cancel button
  const handleCancel = () => {
    router.back();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
      });

      if (user.avatar?.url) {
        const avatarUrl = getFullAvatarUrl(user.avatar.url);
        setPreviewUrl(avatarUrl);
      }
    }
  }, [user]);

  const getFullAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${url}`;
    }
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
      setShowUploadModal(false);
    }
  };

  const handleUploadClick = (type) => {
    setUploadType(type);
    if (type === "device") {
      fileInputRef.current?.click();
    } else {
      // Handle library upload - you'll need to implement this
      console.log("Open media library");
    }
    setShowUploadModal(false);
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

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-200 rounded-lg max-w-lg w-full relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-white hover:bg-gray-500 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
        {error && (
          <div
            className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg"
            role="alert"
          >
            {success}
          </div>
        )}

        <div className="space-y-2">
          <div className="mt-2 flex items-center justify-center">
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="relative w-24 h-24 cursor-pointer transition-transform hover:scale-105"
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

              {showMenu && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      setShowImageModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    View Image
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Update Avatar
                  </button>
                </div>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
            aria-hidden="true"
          />

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
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
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  placeholder="Leave blank to keep current password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 text-white bg-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

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
              <p className="text-sm text-gray-500 mt-1">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center ">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Profile"
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-500 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Image Preview Modal */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)}>
        <div className="p-6 ">
          <div className="relative w-full h-96">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Upload Options Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Update Avatar</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleUploadClick("device")}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg hover:bg-gray-500"
            >
              <Upload className="h-8 w-8 mb-2" />
              <span>Upload from Device</span>
            </button>
            <button
              onClick={() => handleUploadClick("library")}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg hover:bg-gray-500"
            >
              <Camera className="h-8 w-8 mb-2" />
              <span>Choose from Library</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserEditForm;