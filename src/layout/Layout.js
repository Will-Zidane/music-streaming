import Head from "next/head";
import React from "react";
export default function Layout({
                                   pageProps,
                                   children,
                                   title,
                                   desc,
                                   logo,
                                   footers,
                               }) {
    // console.log('pageProps in layout', pageProps)
    return (
        <div className="tw-bg-black-900">
            <Head>
                <title>{title ? `KNX SmartHome | ${title}` : "KNX SmartHome"}</title>
                {desc && <meta name="description" content={desc} />}
            </Head>
            {children}
        </div>
    );
}
