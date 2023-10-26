import { getSession } from "@auth0/nextjs-auth0"
import clientPromise from "../lib/mongodb"

export const getAppPorps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res)
  const client = await clientPromise
  const db = client.db("Blog")
  const user = await db.collection("users").findOne({
    auth0Id: userSession.user.sub
  })

  if (!user) {
    return {
      availableTokens: 0,
      posts: []
    }
  }

  const posts = await db.collection("posts").find({
    userId: user._id
  }).sort({
    created_at: -1
  }).toArray()

  return {
    availableTokens: user.availableTokens || 0,
    posts: posts.map(({created_at, _id, userId, ...rest}) => ({
      _id: _id.toString(),
      created: created_at.toString(),
      ...rest
    })),
    postId: ctx.params?.postid || null
  }
}