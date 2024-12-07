import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/utils/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(identifier, password);
      router.push('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center  px-6 py-12 lg:px-8">

      <div className="bg-gray-500 mx-auto p-10 rounded-lg">

        <div className="sm:mx-auto sm:w-full sm:max-w-sm ">
          <Link href="/" className="flex justify-center">
            <img
              className="h-10 w-auto"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              alt="Music Streaming"
            />
          </Link>
          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
            Đăng nhập vào tài khoản của bạn
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-900">
                Email hoặc tên đăng nhập
              </label>
              <div className="mt-2">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  placeholder="Email hoặc tên đăng nhập"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Mật khẩu
                </label>
                <div className="text-sm">
                  <a href="/forgotpassword" className="font-semibold text-white hover:text-gray-200">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-500 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black-200 hover:bg-gray-300 px-3 py-1.5 text-sm font-semibold text-white shadow-sm  focus:outline focus:outline-2 focus:outline-indigo-600"
              >
                Đăng nhập
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-white">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-gray-200">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}