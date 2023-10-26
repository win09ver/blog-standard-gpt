import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { Configuration, OpenAIApi } from 'openai';
import clientPromise from '../../lib/mongodb';

export default withApiAuthRequired(async function handler(req, res) {
  // access to mongodb
  const { user } = await getSession(req, res)
  const client = await clientPromise
  const db = client.db("Blog")

  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub
  })

  if (!userProfile?.availableTokens) {
    res.status(403)
    return
  }

  // access to openApi
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openaiCall = new OpenAIApi(config);
  const { topic, keywords } = req.body;

  console.log('topic => ', topic);
  console.log('keywords => ', keywords);

  if (!topic || !keywords) {
    res.status(422)
    return
  }
  if (topic.length > 80 || keywords.length > 80) {
    res.status(422)
    return
  }
  console.log('------------------- generating ↓↓↓ -------------------');

  // use model text-davinci-003
  //   await useDavinci003Model(res, openaiCall, topic, keywords)
  // use model gpt-3.5-turbo
  const postMessage = await useGpt3point5turboModel(res, openaiCall, topic, keywords);
  const { postContent, title, metaDescription } = postMessage

  await db.collection("users").updateOne({
    auth0Id: user.sub
  }, {
    $inc: {
      availableTokens: -1
    }
  })
  console.log('updated target users tokens (-1)');

  const insertedPostResult = await db.collection("posts").insertOne({
    postContent,
    title,
    metaDescription,
    topic,
    keywords,
    userId: userProfile._id,
    created_at: new Date()
  })
  console.log('inserted results to posts', insertedPostResult);

  // resp
  res.status(200).json({
    postId: insertedPostResult.insertedId
  });
})

const useDavinci003Model = async (res, openaiCall, topic, keywords) => {
  const prompt = `
    Write a long and detailed SEO-friendly blog post about ${topic},
    that targets the following comma-separated keywords: ${keywords},
    The content should be formatted in SEO-friendly HTML.
    The response must also include appropriate HTML title and meta description content.
    The return format must be stringified JSON in the following format:
    {
      "postContent": post content here
      "title": title goes here
      "metaDescription": meta description goes here
    }.
  `;
  const openaiResp = await openaiCall.createCompletion({
    model: 'text-davinci-003',
    temperature: 0,
    max_tokens: 3600,
    prompt,
  });
  console.log('resp', openaiResp);
  const postMessage = JSON.parse(openaiResp.data.choices[0].text.split('/n').join(''))
  return postMessage
};

const useGpt3point5turboModel = async (res, openaiCall, topic, keywords) => {
  const postContentResp = await openaiCall.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a blog post generator',
      },
      {
        role: 'user',
        content: `
            Write a long and detailed SEO-friendly blog post about ${topic},
            that targets the following comma-separated keywords: ${keywords},
            The content should be formatted in SEO-friendly HTML.
            limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.
            `,
      },
    ],
  });
  const postContent = postContentResp.data.choices[0].message.content || '';
  console.log('postContentResp => ', postContent);
  console.log('------------------- generating ↓↓↓ -------------------');

  const titleResp = await openaiCall.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a blog post generator',
      },
      {
        role: 'user',
        content: `
            Write a long and detailed SEO-friendly blog post about ${topic},
            that targets the following comma-separated keywords: ${keywords},
            The content should be formatted in SEO-friendly HTML.
            limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.
            `,
      },
      {
        role: 'assistant',
        content: postContent,
      },
      {
        role: 'user',
        content: 'Generate appropriate title tag text for the above blog post',
      },
    ],
  });
  const title = titleResp.data.choices[0].message.content || '';
  console.log('titleResp => ', title);
  console.log('------------------- generating ↓↓↓ -------------------');

  const metaDescriptionResp = await openaiCall.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a blog post generator',
      },
      {
        role: 'user',
        content: `
            Write a long and detailed SEO-friendly blog post about ${topic},
            that targets the following comma-separated keywords: ${keywords},
            The content should be formatted in SEO-friendly HTML.
            limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, li, ol, ul, i.
            `,
      },
      {
        role: 'assistant',
        content: postContent,
      },
      {
        role: 'user',
        content: 'Generate SEO-friendly meta description content for the above blog post',
      },
    ],
  });
  const metaDescription = metaDescriptionResp.data.choices[0].message.content || '';
  console.log('metaDescriptionResp => ', metaDescription);

  return {
    postContent,
    title,
    metaDescription,
  }
};
