import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const SpotifyPremiumStudent = () => {
  const ActionButton = ({ text }) => (
    <button className={"w-full bg-[#282828] text-white p-4 rounded-xl hover:bg-gray-200 transition-colors " }>
      <div className={"flex justify-between items-center"}>
        <span className="font-medium">{text}</span>
        <ChevronRight className="w-6 h-6" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      {/* Premium Plan Card */}
      <Link href={"/payment"}>
        <div className="bg-[#282828] rounded-xl p-6 mb-4 hover:bg-gray-200">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-zinc-400">Gói của bạn</p>
                <h1 className="text-4xl font-bold text-[#B4A2D3]">
                  Premium Student
                </h1>
                <p className="text-zinc-400 mt-2">
                  Hóa đơn tiếp theo của bạn có giá 29.500đ vào 26/11/24.
                </p>
                <p className="text-zinc-400 mt-2">Ví Paypal</p>
              </div>
              <div className="w-8 h-8">
                <svg
                  viewBox="0 0 24 24"
                  className="text-[#B4A2D3] w-full h-full"
                >
                  <path
                    fill="currentColor"
                    d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Account Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Tài khoản</h2>
        <div className="space-y-2">
          <div >
            <Link href={"/profile"}>
              <ActionButton  text="Chỉnh sửa hồ sơ" />
            </Link>
          </div>
          <ActionButton text="Khôi phục danh sách phát" />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPremiumStudent;
