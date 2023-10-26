import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { AppLayout } from '../../components/AppLayout';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { getAppPorps } from '../../utils/getAppProps';

export default function Post(props) {

  console.log("Post props", props)
  return (
    <div className='overflow-auto h-full'>
      <div className='max-w-screen-sm mx-auto'>
        <div className='text-sm foot-bold mt-6 p-2 bg-stone-200 rounded-sm'>
          SEO title and meta description
        </div>
        <div className='p-4 my-2 border border-stone-200 rounded-sm'>
          <div className='text-blue-600 text-2xl font-bold'>{props.title}</div>
          <div className='mt-2'>{props.metaDescription}</div>
        </div>
        <div className='text-sm foot-bold mt-6 p-2 bg-stone-200 rounded-sm'>
          Keywords
        </div>
        <div className='flex flex-wrap pt-2 gap-1'>
          {props.keywords.split(",").map((keyword, i) =>(
            <div key={i} className='p-2 rounded-full bg-slate-800 text-white'>
              <FontAwesomeIcon icon={faHashtag}/>{keyword}  
            </div>
          ))}
        </div>
        <div className='text-sm foot-bold mt-6 p-2 bg-stone-200 rounded-sm'>
          Blog post
        </div>
        <div dangerouslySetInnerHTML={{__html: props.postContent || ""}}/>
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(pages, pageProps) {
  return <AppLayout {...pageProps}> {pages} </AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppPorps(ctx)

    const userSession = await getSession(ctx.req, ctx.res)
    const client = await clientPromise
    const db = client.db("Blog")
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub
    })

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postid),
      userId: user._id
    })

    if (!post) {
      return {
        redirect: {
          destination: "/post/new",
          permanent: false
        }
      }
    }

    return {
      props: {
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        ...props
      }
    }
  }
});
