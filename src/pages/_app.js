import "@/styles/globals.css";
import { MusicProvider } from "@/components/MusicProvider/MusicProvider";

export default function App({ Component, pageProps }) {
  return (
    <MusicProvider>
      <Component {...pageProps} />
    </MusicProvider>
  );
}
