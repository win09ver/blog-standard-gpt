import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../components/AppLayout/AppLayout';
import { getAppPorps } from '../utils/getAppProps';

export default function TokenTopup() {

  const handleAddToken = async () => {
    const result = await fetch(`/api/addTokens`, {
      method: "POST"
    })

    const json = await result.json()
    console.log("token-top json", json)
    window.location.href = json.url
  }
  return (
    <div>
      <h1>This is TokenTopup page</h1>
      <button className='btn' onClick={handleAddToken}>Add Tokens</button>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(pages, pageProps) {
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
