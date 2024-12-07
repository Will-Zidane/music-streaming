
import { useState } from 'react';

const LoginForm = () => {
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const toggleSignup = () => {
    setIsSignupActive((prev) => !prev);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="w-[800px] h-[400px] border border-gray-200 shadow-xl flex justify-center items-center">
      <div
        className={`w-[75%] transition-all duration-500 bg-white ${
          isSignupActive ? 'w-[25%] bg-red-600 cursor-pointer' : ''
        }`}
      >
        <div
          className={`absolute top-1/2 left-0 transform -translate-y-1/2 text-4xl font-light text-center transition-all duration-500 ${
            isSignupActive ? 'text-white' : 'text-red-600'
          }`}
        >
          {isSignupActive ? 'Signup' : 'Login'}
        </div>
        <form
          className={`absolute top-[110px] left-[60px] transition-transform duration-500 ${
            isSignupActive ? 'transform translate-x-[200%] opacity-0' : ''
          }`}
        >
          <div className="py-4">
            <input
              type="text"
              placeholder="EMAIL"
              className="w-[350px] p-[10px] pl-[25px] border border-gray-200 text-uppercase shadow-md outline-none"
            />
          </div>
          <div className="py-4 relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="PASSWORD"
              className="w-[350px] p-[10px] pl-[25px] border border-gray-200 text-uppercase shadow-md outline-none"
            />
            <span
              className="absolute top-1/2 right-5 transform -translate-y-1/2 text-red-600 text-sm font-light cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? 'Hide' : 'Show'}
            </span>
          </div>
          <div className="py-4">
            <button
              type="button"
              className="w-[350px] p-[15px] text-gray-600 border border-gray-200 uppercase transition-all duration-300 hover:text-red-600 hover:border-red-600 hover:shadow-md"
            >
              Login
            </button>
          </div>
        </form>
        <form
          className={`absolute top-[110px] left-[60px] transform translate-x-[200%] opacity-0 transition-all duration-500 ${
            isSignupActive ? 'transform-none opacity-100' : ''
          }`}
        >
          <div className="py-4">
            <input
              type="text"
              placeholder="EMAIL"
              className="w-[350px] p-[10px] pl-[25px] border border-gray-200 text-uppercase shadow-md outline-none"
            />
          </div>
          <div className="py-4 relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="PASSWORD"
              className="w-[350px] p-[10px] pl-[25px] border border-gray-200 text-uppercase shadow-md outline-none"
            />
            <span
              className="absolute top-1/2 right-5 transform -translate-y-1/2 text-red-600 text-sm font-light cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? 'Hide' : 'Show'}
            </span>
          </div>
          <div className="py-4">
            <button
              type="button"
              className="w-[350px] p-[15px] text-gray-600 border border-gray-200 uppercase transition-all duration-300 hover:text-red-600 hover:border-red-600 hover:shadow-md"
            >
              Signup
            </button>
          </div>
        </form>
      </div>

      {/* Switch buttons */}
      <div
        className={`absolute top-1/2 left-[75%] transform -translate-y-1/2 cursor-pointer ${
          isSignupActive ? 'bg-white' : 'bg-red-600'
        }`}
        onClick={toggleSignup}
      >
        <div
          className={`w-[100px] h-[100px] flex justify-center items-center text-center text-white font-light`}
        >
          {isSignupActive ? 'Login' : 'Signup'}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
