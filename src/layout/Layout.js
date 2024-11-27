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
  const navbarHeight = 64; // Giả sử navbar cao 64px
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>{title ? `${title}` : "Music Streaming"}</title>
        {desc && <meta name="description" content={desc} />}
      </Head>
      <div className={`bg-gray-500`}>
        <Navbar />
      </div>

      <div className="flex-1 mt-16 mb-20 overflow-auto bg-gray-100">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel
            defaultSize={30}
            maxSize={70}
            minSize={6}
            className="h-full bg-gray-100 overflow-y-auto rounded-md"
          >
            <Library isReadOnly={!isAuthenticated} />
          </Panel>

          <PanelResizeHandle className="w-1 active:bg-white hover:bg-gray-200 bg-gray-600 transition-colors z-10" />

          <Panel
            minSize={30}
            className="h-full bg-gray-100 rounded-md overflow-y-auto"
          >
            <div className={!isAuthenticated ? 'pointer-events-none' : ''}>
              {children}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-20 bg-gray-100 border-t border-gray-300"
        style={{ height: `${playerHeight}px` }}
      >
        {isAuthenticated ? (
          <SongPlayer />
        ) : (
          <div className="h-full flex items-center justify-between px-4 bg-gradient-to-r from-purple-600 to-blue-500">
            <div className="text-white">
              <h3 className="font-bold">Preview of Music Streaming</h3>
              <p className="text-sm">Sign up to get unlimited songs and podcasts with occasional ads. No credit card
                needed.</p>
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