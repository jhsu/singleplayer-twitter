import Link from "next/link"
import { DateTime } from "luxon"

interface TweetProps {
  id: string
  content: string
  username: string
  createdAt: string
  replyToId?: string
  parentLink?: boolean
}
export const Tweet = ({
  id,
  content,
  username,
  createdAt: created_at,
  replyToId: reply_to_id,
  parentLink = true,
}: TweetProps) => {
  return (
    <div key={id} className="border-b p-4">
      <div className="flex gap-2 text-gray-600">
        {parentLink && reply_to_id && (
          <Link href={`/tweets/${reply_to_id}`}>Show thread</Link>
        )}
      </div>
      <div className="flex gap-2">
        <span className="font-bold">
          <Link href={`/api/personas/${username.toLowerCase()}`}>
            {username}
          </Link>
        </span>
        <span className="text-gray-600">
          <Link href={`/tweets/${id}`}>
            {DateTime.fromISO(created_at).toRelative()}
          </Link>
        </span>
      </div>
      <div dir="auto">{content}</div>
    </div>
  )
}
