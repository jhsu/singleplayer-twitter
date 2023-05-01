import { cn } from "@/lib/utils"

export const LoadingBox = ({
  half,
  className,
}: {
  half?: boolean
  className?: string
}) => {
  return (
    <div
      className={cn(
        `h-4 rounded bg-gray-400 ${half ? "w-1/2" : "w-full"}`,
        className
      )}
    ></div>
  )
}
