"use client"

import { useRef } from "react"
import * as Form from "@radix-ui/react-form"
import useSWRMutation from "swr/mutation"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

async function publishTweet(
  key: string,
  options: { arg: { tweet: string; username: string } }
) {
  const { tweet, username } = options.arg
  return fetch("/tweets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tweet, username }),
  })
}

const ComposeTweet = () => {
  const triggerRefresh = useStore((state) => state.triggerRefresh)

  const $form = useRef<HTMLFormElement | null>(null)

  const { trigger, isMutating } = useSWRMutation("/tweets", publishTweet, {
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
          const target = evt.currentTarget
          console.log("form data", data)
          trigger({
            tweet: data["compose_tweet"] as string,
            username: data["username"] as string,
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
