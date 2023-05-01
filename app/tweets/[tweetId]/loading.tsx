import { LoadingBox } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <LoadingBox />
      <LoadingBox className="h-24" />
    </div>
  )
}
