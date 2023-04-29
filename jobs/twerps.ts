import fs from "fs"
import path from "path"
import { loadEnvConfig } from "@next/env"
import { PostgrestResponse, createClient } from "@supabase/supabase-js"
import { Configuration, OpenAIApi } from "openai"
import pino from "pino"

import { aiPersonas } from "./personas"
import { AIPersona, Tweet, TweetRow } from "./types"

loadEnvConfig(path.join(__dirname, "../"))
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: {
    target: "pino-pretty",
  },
})

logger.debug({ supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY }, "env")

/*
# SECTION FOR TWEET GENERATION
*/
// system prompt
const SYSTEM_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "./TEMPLATE.md"),
  "utf8"
)

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

function formatUserPrompt(persona: AIPersona): string {
  return `Now, ${
    persona.username
  } feels like tweeting about their latest thoughts or experiences. The current date is ${new Date().toLocaleDateString()}. Compose a tweet with less than 140 characters. Only return the tweet without quotes.`
}

async function postTweet(persona: AIPersona, previousTweets: Tweet[]) {
  const userPrompt = formatUserPrompt(persona)
  logger.debug(
    { username: persona.username, prompt: userPrompt },
    ".postTweet: Creating prompt to generate tweet"
  )

  const resp = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
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
async function checkForTweet(): Promise<void> {
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
  // TODO: Split by instance
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

// Schedule the checkForTweet function to run every 5 minutes
setInterval(checkForTweet, 5 * 60 * 1000)
checkForTweet()
