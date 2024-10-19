import Head from "next/head";
import React from "react";
import Navbar from "@/layout/Header/Navbar";

export default function Layout({
                                 children, title, desc
                               }) {
  return (<div className="min-h-[380px]">
      <Head>
        <title>{title ? `Music Streaming | ${title}` : "Music Streaming"}</title>
        {desc && <meta name="description" content={desc} />}
      </Head>
      <Navbar />
      {children}
    </div>);
}
