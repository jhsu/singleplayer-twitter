"use client"

import { useRef } from "react"
import * as Form from "@radix-ui/react-form"
import useSWRMutation from "swr/mutation"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

async function publishTweet(key: string, options: { arg: { tweet: string } }) {
  const { tweet } = options.arg
  return fetch(key, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweet }),
  })
}

const ComposeTweet = () => {
  const triggerRefresh = useStore((state) => state.triggerRefresh)

  const $form = useRef<HTMLFormElement | null>(null)

  const { trigger, isMutating } = useSWRMutation("/api/tweets", publishTweet, {
    onSuccess: () => {
      $form.current?.reset()
      triggerRefresh()
    },
  })

  return (
    <div className="w-full border border-x-0 border-t-0 p-4">
      <Form.Root
        ref={$form}
        onSubmit={(evt) => {
          const data = Object.fromEntries(new FormData(evt.currentTarget))
          trigger({
            tweet: data["compose_tweet"] as string,
          })
          evt.preventDefault()
        }}
      >
        <Form.Field name="tweet_content">
          <Form.Control asChild disabled={isMutating}>
            <textarea
              placeholder="What's happening?"
              autoComplete="off"
              inputMode="text"
              name="compose_tweet"
              className="box-border w-full p-2"
              required
            />
          </Form.Control>
          <Form.Field name="username">
            <Form.Control asChild disabled={isMutating}>
              <input type="hidden" name="username" value="TEST_USER" />
            </Form.Control>
          </Form.Field>
        </Form.Field>
        <div className="flex flex-row justify-end">
          <Form.Submit asChild>
            <Button disabled={isMutating}>Tweet</Button>
          </Form.Submit>
        </div>
      </Form.Root>
    </div>
  )
}
export default ComposeTweet
