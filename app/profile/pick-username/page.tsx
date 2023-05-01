"use client"

import { useRouter } from "next/navigation"
import * as Form from "@radix-ui/react-form"
import useSWRMutation from "swr/mutation"

import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

async function postUsername(
  key: string,
  options: { arg: { username: string } }
) {
  const { username } = options.arg
  const res = await fetch(key, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  })
  return res.json()
}

export default function Page() {
  const router = useRouter()
  const setProfile = useStore((state) => state.setProfile)
  const { trigger, isMutating } = useSWRMutation(
    "/api/profile/pick-username",
    postUsername,
    {
      onSuccess: (data) => {
        setProfile({
          id: data.id,
          username: data.username,
        })
        router.push("/")
      },
      onError: (err) => {
        console.error(err)
      },
    }
  )

  return (
    <div>
      <Form.Root
        action="/profile"
        method="POST"
        onSubmit={(evt) => {
          const data = Object.fromEntries(new FormData(evt.currentTarget))
          trigger({
            username: data["username"] as string,
          })
          evt.preventDefault()
          evt.stopPropagation()
        }}
      >
        <Form.Field name="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            asChild
            disabled={isMutating}
            placeholder="Enter a username"
            name="username"
          >
            <Input />
          </Form.Control>
          <Button type="submit" disabled={isMutating}>
            Save
          </Button>
        </Form.Field>
      </Form.Root>
    </div>
  )
}
