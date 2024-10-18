import React, { useState } from "react";
import Layout from "@/layout/Layout";
import Library from "@/components/Library/Library";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import SongPlayer from "@/components/SongPlayer/SongPlayer";
import Playlist from "@/components/Playlist/Playlist";

const Home = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const playlistData = [
    {
      title: "Houdini",
      artist: "Eminem",
      url: "audio/y2meta.com - Eminem - Houdini [Official Music Video] (128 kbps).mp3",
      coverArt: '/api/placeholder/56/56'
    },
    {
      title: "See You Again",
      artist: "Charlie Puth ft. Wiz Khalifa",
      url: "audio/y2meta.com - Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack (128 kbps).mp3",
      coverArt: '/api/placeholder/56/56'
    },
    // Add more tracks as needed
  ];
  // Assume the height of your SongPlayer. Adjust this value as needed.
  const playerHeight = 80; // in pixels
  const handleTrackChange = (index) => {
    setCurrentTrackIndex(index);
  };

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
                playlist={playlistData}
                currentTrackIndex={currentTrackIndex}
                onTrackSelect={handleTrackChange}
              />
            </Panel>
          </PanelGroup>
        </Layout>
      </div>
      <div style={{ height: `${playerHeight}px` }} className="flex-shrink-0">
        <SongPlayer
          playlist={playlistData}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={handleTrackChange}
        />
      </div>
    </div>
  );
};

export default Home;