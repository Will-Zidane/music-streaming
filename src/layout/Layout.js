import Head from "next/head";
import React from "react";
import Navbar from "@/layout/Header/Navbar";
import Library from "@/components/Library/Library";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SongPlayer from "@/components/SongPlayer/SongPlayer";

export default function Layout({ children, title, desc }) {
  const playerHeight = 80;

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title ? ` ${title}` : "Music Streaming"}</title>
        {desc && <meta name="description" content={desc} />}
      </Head>

      <Navbar />

      <div className="flex-1 h-[calc(100vh-144px)]"> {/* 144px = navbar(64px) + player(80px) */}
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={30} maxSize={70} minSize={6}>
            <div className="h-full bg-gray-100 overflow-y-auto rounded-md">
              <Library />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 active:bg-white hover:bg-gray-600 transition-colors" />

          <Panel minSize={30} className="bg-gray-100 rounded-md overflow-y-auto">
            <div className="h-full">
              {children}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <div
        style={{ height: `${playerHeight}px` }}
        className="fixed bottom-0 left-0 right-0 bg-white"
      >
        <SongPlayer

        />
      </div>
    </div>
  );
}