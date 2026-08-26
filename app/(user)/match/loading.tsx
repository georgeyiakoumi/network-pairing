import { Spinner } from '@/components/ui/spinner'

export default function MatchLoading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 gap-3">
      <Spinner className="size-6" />
      <p className="text-sm text-muted-foreground">Finding your best matches…</p>
    </main>
  )
}
