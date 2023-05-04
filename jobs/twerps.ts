import path from "path"
import { loadEnvConfig } from "@next/env"
import { PostgrestResponse, createClient } from "@supabase/supabase-js"
import { Configuration, OpenAIApi } from "openai"
import pino from "pino"

import { AIPersona, Tweet, TweetRow } from "@/lib/types"
import { aiPersonas } from "./personas"
import { TEMPLATE as SYSTEM_TEMPLATE } from "./template"

loadEnvConfig(path.join(__dirname, "../"))
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

type Sentiment = "positive" | "neutral" | "negative"

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: {
    target: "pino-pretty",
  },
})
// const logger = {
//   debug: (...info) => {},
//   info: console.info,
//   error: console.error,
// }

/**
 * Format the system message to be used in the prompt
 * @param {AIPersona} persona - The acting AI Persona
 * @param {Tweet[]} previousTweets
 * @returns {string} systemMessage - the system message to be used in the prompt
 */
export function formatSystemMessage(
  persona: AIPersona,
  previousTweets: Tweet[]
): string {
  const variables = {
    ...persona,
    current_date: new Date().toISOString(),
    previous_tweets:
      previousTweets.length > 0
        ? previousTweets.map(
            (tweet) => `- ${tweet.content} | Tweeted on ${tweet.created_at}`
          )
        : "(No previous tweets.)",
  }

  const systemMessage = SYSTEM_TEMPLATE.replace(
    /\{([^{]+)\}/g,
    (match, variable) => {
      const value = variables[variable.trim()]
      return value ? value : match
    }
  )
  logger.debug(
    { username: persona.username, systemMessage },
    "Formatted system message"
  )
  return systemMessage
}

/**
 * Prompt to try and get an interseting tweet from the persona
 * @param persona
 * @param sentiment
 * @returns
 */
function formatUserPrompt(
  persona: AIPersona,
  sentiment: Sentiment = "neutral"
): string {
  return `Pick one of the folling categories to talk about:
- Personal Life: Tweets about daily activities, personal experiences, hobbies, and interests.
-News and Current Events: Tweets about local, national, or international news, political developments, and trending topics.
-Entertainment: Tweets about movies, TV shows, music, celebrities, and pop culture.
- Travel and Adventure: Tweets about travel destinations, vacation experiences, outdoor adventures, and travel tips.
- Food and Cooking: Tweets about recipes, cooking tips, restaurant reviews, and food-related experiences.
- Health and Wellness: Tweets about fitness, nutrition, mental health, wellness tips, and self-care practices.
- Technology and Gadgets: Tweets about new tech products, software updates, gadget reviews, and technology trends.
- Education and Learning: Tweets about educational resources, online courses, learning tips, and academic achievements.
- Humor and Memes: Tweets that share jokes, funny anecdotes, memes, and humorous observations.
- Inspiration and Motivation: Tweets that share motivational quotes, inspirational stories, and positive affirmations.
- Pick a random interesting topic and mix it with your interests
- Have a deep thought
- Talk about your day
- Have a hot take to share
- Complain about something
- Pick a single word
- Make a statement
- Tweet 3 words
- Make a joke
- Comment about work
- Ask a question

---

Compose an message to post online that is different with less than 140 characters that you will post and share with others.

Don't talk about life in general, but be specific. Don't write something that you've talked about before.

Only respond with text without quotes. Do not include hashtags (words that start with '#'). Do not include the category at the beginning of your message.`
}

async function postReply(
  persona: AIPersona,
  from: string,
  tweet: string,
  options: Partial<TweetRow>
) {
  logger.debug(
    { username: persona.username, tweet },
    ".replyTweet: Creating prompt to generate tweet"
  )

  const resp = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    messages: [
      { role: "system", content: formatSystemMessage(persona, []) },
      {
        role: "user",
        content: `Author: ${from}
Tweet: "${tweet}"

Write a reply. Only respond with the message and don't include your username or quotes.`,
        name: persona.username,
      },
    ],
  })

  const reply = resp.data.choices[0]?.message.content.replace(
    /^["']|["']$/g,
    ""
  )
  logger.info(`.replyTweet [${persona.username}]: ${reply}`)
  await supabase.from("timeline").insert({
    ...options,
    username: persona.username,
    content: reply,
  })
}

const sentimentOptions: Sentiment[] = ["positive", "neutral", "negative"]
async function postTweet(
  persona: AIPersona,
  previousTweets: Tweet[],
  options?: Partial<TweetRow>
) {
  var sentiment =
    sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)]
  const userPrompt = formatUserPrompt(persona, sentiment)
  logger.debug(
    { username: persona.username, prompt: userPrompt },
    ".postTweet: Creating prompt to generate tweet"
  )

  const resp = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 1,
    messages: [
      { role: "system", content: formatSystemMessage(persona, previousTweets) },
      { role: "user", content: userPrompt, name: persona.username },
    ],
  })
  // Remove quotes. For some reason even when instructed, it includes quotes.
  const tweet = resp.data.choices[0]?.message.content.replace(
    /^["']|["']$/g,
    ""
  )
  logger.info(`.postTweet [${persona.username}]: ${tweet}`)
  await supabase.from("timeline").insert({
    ...options,
    username: persona.username,
    content: tweet,
  })
}

/*
# GET CONTEXT
*/

/**
 * Get the user's recent tweets
 * @param {string} username
 * @returns {Tweet[]}
 */
async function getRecentTweets(username: string): Promise<Tweet[]> {
  const { data, error } = await supabase
    .from("timeline")
    .select()
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    throw error
  }

  return data as Tweet[]
}

function summarizePersona(persona: AIPersona): string {
  return `username: ${persona.username}. ${persona.username} is a ${persona.activity_level} activity level user. Interests: ${persona.interests}, Expertise: ${persona.expertise}, Opininated: ${persona.opinionated_neutral}, Tone: ${persona.tone}.`
}

async function checkToReply() {
  logger.debug(".checkToReply")

  // find recent tweets made by the user.
  // in the future we should let AI respond to AI
  const recentUserTweets = await supabase
    .from("timeline")
    .select()
    // .not("user_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(10)
  const crowd = aiPersonas.map(summarizePersona).join("\n\n")

  for (const tweet of recentUserTweets.data as TweetRow[]) {
    logger.debug(
      { tweet: tweet.content },
      "checking if any persona wants to reply"
    )
    const resp = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 1,
      messages: [
        {
          role: "system",
          content: `You are an AI that determines if any user given their personality would likely reply to a tweet. Determine whether a persona might reply based on their persona, but also leave room for chance.

Users:
${crowd}

---

If any are likely to reply, respond with just their username, if not, respond with "none". Only choose one. The user will give you a tweet.`,
        },
        { role: "user", content: tweet.content, name: tweet.username },
      ],
    })
    const respondingUser = resp.data.choices[0].message.content
    // create tweet

    const respondingPersona = aiPersonas.find(
      (persona) => persona.username === respondingUser
    )
    logger.debug(
      {
        user: respondingUser,
        persona: respondingPersona?.username,
      },
      "[checkToReply] respondingUser"
    )

    if (
      respondingPersona &&
      tweet.username.toLowerCase() !== respondingPersona.username.toLowerCase()
    ) {
      // ensure the persona hasn't already replied to the tweet
      const existingReply = await supabase
        .from("timeline")
        .select()
        .eq("reply_to_id", tweet.id)
        .eq("username", respondingPersona?.username)
        .limit(1)
        .maybeSingle()
      if (existingReply.data) {
        logger.debug(
          `${respondingPersona?.username} already replied to ${tweet.id}`
        )
        continue
      }

      await postReply(respondingPersona, tweet.username, tweet.content, {
        reply_to_id: tweet.id,
      })
    }
  }

  // check if any persona wants to respond to the tweet
  // summarize all persona
}

async function getAllRecentTweets() {
  const { data, error }: PostgrestResponse<TweetRow> = await supabase.rpc(
    "get_latest_timeline_entries"
  )

  if (error) {
    logger.error({ error }, "Failed to get all recent tweets")
    throw error
  } else {
    logger.debug({ data }, "Got all recent tweets")
    return data
  }
}

/**
 * Check if the user should tweet based on their tweet frequency and randomness
 */
export async function checkForTweet(): Promise<boolean> {
  const now = new Date()
  const history = await getAllRecentTweets()
  // group all recent tweets by username
  const historyLookup = history.reduce((acc, curr) => {
    if (!acc[curr.username]) {
      acc[curr.username] = [curr]
    } else {
      acc[curr.username] = acc[curr.username].concat(curr)
    }
    return acc
  }, {} as Record<string, TweetRow[]>)
  for (const persona of aiPersonas) {
    // const tweets = await getRecentTweets(persona.username)
    const tweets = historyLookup[persona.username] ?? []
    const lastTweetTime = tweets[0]?.created_at
      ? new Date(tweets[0]?.created_at)
      : null
    const shouldPost =
      shouldTweetFrequency(persona) ||
      shouldTweetElapsed(persona, lastTweetTime, now)

    if (shouldPost) {
      await postTweet(persona, tweets)
    }
  }
  return true
}

/**
 * Determine if the user should tweet based on their tweet frequency and randomness
 * @params {AIPersona} persona
 */
function shouldTweetFrequency(persona: AIPersona): boolean {
  const randomNumber = Math.random()
  let probability: number

  switch (persona.activity_level) {
    case "High":
      probability = 0.8
      break
    case "Medium":
      probability = 0.5
      break
    case "Low":
      probability = 0.2
      break
    default:
      probability = 0
  }
  logger.debug(
    { username: persona.username, probability },
    randomNumber < probability
      ? "Frequency check passed"
      : "Frequency check failed"
  )

  return randomNumber < probability
}

function shouldTweetElapsed(
  persona: AIPersona,
  lastTweetDate: Date | null,
  currentDate: Date
): boolean {
  const elapsedTime = lastTweetDate
    ? currentDate.getTime() - lastTweetDate.getTime()
    : Infinity
  let tweetFrequencyMs: number

  switch (persona.activity_level) {
    case "High":
      tweetFrequencyMs = 1 * 60 * 60 * 1000 // 1 hours
      break
    case "Medium":
      tweetFrequencyMs = 2 * 60 * 60 * 1000 // 2 hours
      break
    case "Low":
      tweetFrequencyMs = 4 * 60 * 60 * 1000 // 4 hours
      break
    default:
      tweetFrequencyMs = Number.MAX_VALUE
  }

  logger.debug(
    { username: persona.username, elapsedTime },
    elapsedTime >= tweetFrequencyMs
      ? "Elasped tweet time"
      : "Did not elapse tweet time"
  )

  return elapsedTime >= tweetFrequencyMs
}

const checkLoop = async () => {
  await checkForTweet()
  // await checkToReply()

  setTimeout(checkLoop, 5 * 60 * 1000)
}
checkLoop()
