import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/utils/AuthContext";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { register } = useAuth();

  // Previous validation functions remain the same...
  const validateUsername = (username) => {
    if (!username) return "Tên đăng nhập không được để trống";
    if (username.length < 3) return "Tên đăng nhập phải có ít nhất 3 ký tự";
    if (username.length > 20) return "Tên đăng nhập không được quá 20 ký tự";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return "Tên đăng nhập chỉ chứa chữ cái, số và gạch dưới";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email không được để trống";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Địa chỉ email không hợp lệ";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Mật khẩu không được để trống";
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ hoa";
    if (!/[a-z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ thường";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất một số";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Comprehensive validation
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError =
      password !== confirmPassword ? "Mật khẩu không khớp" : "";

    // Combine all validation errors
    if (usernameError || emailError || passwordError || confirmPasswordError) {
      setError(
        usernameError || emailError || passwordError || confirmPasswordError,
      );
      return;
    }

    try {
      await register(username, email, password);
      router.push("/login");
    } catch (err) {
      // Error handling remains the same...
      if (err.response?.data?.error?.message) {
        switch (err.response.data.error.message) {
          case "Email is already taken.":
            setError("Email đã được sử dụng. Vui lòng chọn email khác.");
            break;
          case "Username is already taken.":
            setError("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
            break;
          default:
            setError("Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else {
        setError("Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng.");
      }
    }
  };

  // Password visibility toggle component
  const PasswordVisibilityToggle = ({
    show,
    onClick,
    className = "absolute inset-y-0 right-0 flex items-center pr-3",
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <EyeOff size={20} className="text-gray-500" />
      ) : (
        <Eye size={20} className="text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-gray-500 mx-auto p-10 rounded-lg w-full max-w-md">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link href="/" className="flex justify-center">
            <img
              className="h-10 w-auto"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              alt="Music Streaming"
            />
          </Link>
          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
            Tạo tài khoản mới
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Previous input fields remain the same... */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-900"
              >
                Tên đăng nhập
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Mật khẩu
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm pr-10"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordVisibilityToggle
                  show={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-900"
              >
                Xác nhận mật khẩu
              </label>
              <div className="mt-2 relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm pr-10"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <PasswordVisibilityToggle
                  show={showConfirmPassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black-200 hover:bg-gray-300 px-3 py-1.5 text-sm font-semibold text-white shadow-sm focus:outline focus:outline-2 focus:outline-indigo-600"
              >
                Đăng ký
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-white">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-gray-200"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
