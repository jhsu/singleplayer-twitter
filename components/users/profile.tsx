export default function UserProfile({
  profile,
}: {
  profile: { username: string }
}) {
  return (
    <div>
      <div className="text-4xl">@{profile.username}</div>
    </div>
  )
}
