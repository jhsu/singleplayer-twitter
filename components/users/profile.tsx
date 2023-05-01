export default function UserProfile({
  profile,
}: {
  profile: { id: string; username: string }
}) {
  return (
    <div>
      <div className="text-4xl">@{profile.username}</div>
    </div>
  )
}
