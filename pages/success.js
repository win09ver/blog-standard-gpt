import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { getAppPorps } from '../utils/getAppProps';

export default function Success() {

  return (
    <div>
      <h1>Thank you for your purchase!</h1>
    </div>
  );
}

Success.getLayout = function getLayout(pages, pageProps) {
  return <AppLayout {...pageProps}> {pages} </AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppPorps(ctx)
    return {
      props
    }
  }
});
