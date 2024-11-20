import Layout from '@/layout/Layout';
import { MusicProvider } from '@/utils/MusicProvider';
import '@/styles/globals.css';
import { AuthProvider } from "@/utils/AuthContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MusicProvider>
        <Layout
          title={pageProps.title}
          desc={pageProps.description}
        >
          <Component {...pageProps} />
        </Layout>
      </MusicProvider>
    </AuthProvider>

  );
}

export default MyApp;