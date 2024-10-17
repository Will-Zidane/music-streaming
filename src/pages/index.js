import React, { useState } from "react";
import Layout from "@/layout/Layout";
import Library from "@/components/Library/Library";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SongPlayer from "@/components/SongPlayer/SongPlayer";
import Playlist from "@/components/Playlist/Playlist";

const Home = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Assume the height of your SongPlayer. Adjust this value as needed.
  const playerHeight = 80; // in pixels

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-hidden">
        <Layout>
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={20} minSize={6}>
              <div className="h-full bg-gray-100 overflow-y-auto rounded-md">
                <Library />
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 active:bg-white hover:bg-gray-600 transition-colors" />

            <Panel minSize={30} className="bg-gray-100 rounded-md">
              <Playlist
                currentTrackIndex={currentTrackIndex}
                setCurrentTrackIndex={setCurrentTrackIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              />
            </Panel>
          </PanelGroup>
        </Layout>
      </div>
      <div style={{ height: `${playerHeight}px` }} className="flex-shrink-0">
        <SongPlayer
          currentTrackIndex={currentTrackIndex}
          setCurrentTrackIndex={setCurrentTrackIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </div>
    </div>
  );
};

export default Home;