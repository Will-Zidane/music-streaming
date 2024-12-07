import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/AuthContext'; // Now you can access resetPassword from context
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { resetPassword } = useAuth(); // Get resetPassword from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      setIsLoading(false);
      return;
    }

    try {
      // Call the resetPassword method from AuthContext
      await resetPassword(email);
      setSuccess('Password reset instructions sent to your email.');
      setTimeout(() => router.push('/login'), 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state in case of error or success
    }
  };

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
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            Nhập địa chỉ email để đặt lại mật khẩu của bạn
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Địa chỉ email
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear any previous errors when user starts typing
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-700 text-sm text-center bg-green-100 p-2 rounded">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm focus:outline focus:outline-2 focus:outline-indigo-600 
                  ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black-200 hover:bg-gray-300'}`}
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-white">
            Quay lại{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-gray-200"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
