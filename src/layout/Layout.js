import Head from "next/head";
import React from "react";
import { useRouter } from "next/router";
import Navbar from "@/layout/Header/Navbar";
import Library from "@/components/Library/Library";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SongPlayer from "@/components/SongPlayer/SongPlayer";
import { useAuth } from "@/utils/AuthContext";

export default function Layout({ children, title, desc }) {
  const playerHeight = 80;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isLoginPage = router.pathname === '/login';
  const isProfilePage = router.pathname === '/profile';
  const isPaymentPage = router.pathname === '/payment';

  // If on login page, render a simplified layout
  if (isLoginPage || isProfilePage || isPaymentPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{title ? `${title}` : "Login - Music Streaming"}</title>
          {desc && <meta name="description" content={desc} />}
        </Head>
        {children}
      </div>
    );
  }
  return (
  <div className="flex flex-col min-h-screen bg-black">
    <Head>
      <title>{title ? `${title}` : "Music Streaming"}</title>
      {desc && <meta name="description" content={desc} />}
    </Head>
    <Navbar />

    <div className="flex-1 mt-16 mb-20 bg-gray-100">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel with Library */}
        <Panel
          defaultSize={30}
          maxSize={70}
          minSize={6}
          className="bg-gray-100 h-full"
        >
          <div className="h-full ">
            <Library isReadOnly={!isAuthenticated} />
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1 active:bg-white hover:bg-gray-200 bg-gray-600 transition-colors z-10" />

        {/* Right Panel with Children */}
        <Panel
          minSize={30}
          className="bg-gray-100 rounded-md h-full"
        >
          <div className={`h-full overflow-y-auto ${!isAuthenticated ? 'pointer-events-none' : ''}`}>
            {children}
          </div>
        </Panel>
      </PanelGroup>
    </div>

    {/* Footer Player */}
    <div
      className="fixed bottom-0 left-0 right-0 z-20 bg-black-100"
      style={{ height: `${playerHeight}px` }}
    >
      {isAuthenticated ? (
        <SongPlayer />
      ) : (
        <div className="h-full flex items-center justify-between px-4 bg-gradient-to-r from-purple-600 to-blue-500">
          <div className="text-white">
            <h3 className="font-bold">Preview of Music Streaming</h3>
            <p className="text-sm">Sign up to get unlimited songs and podcasts with occasional ads. No credit card needed.</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            Sign up free
          </button>
        </div>
      )}
    </div>
  </div>

);
      }