export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center">
      <div className="flex h-full w-full max-w-[980px] flex-col items-center">
        <div className="h-full w-full max-w-2xl border-0 py-4 sm:border sm:border-y-0">
          {children}
        </div>
      </div>
    </div>
  )
}
