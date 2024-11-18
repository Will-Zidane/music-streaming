import Layout from '@/layout/Layout';
import { MusicProvider } from '@/utils/MusicProvider';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MusicProvider>
      <Layout
        title={pageProps.title}
        desc={pageProps.description}
      >
        <Component {...pageProps} />
      </Layout>
    </MusicProvider>
  );
}

export default MyApp;