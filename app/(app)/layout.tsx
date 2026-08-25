import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppBreadcrumbs } from '@/components/app-breadcrumbs'
import { Separator } from '@/components/ui/separator'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminKey = process.env.ADMIN_SECRET_KEY

  return (
    <SidebarProvider>
      <AppSidebar adminKey={adminKey} />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <AppBreadcrumbs />
        </header>
        <main className="flex flex-1 flex-col min-h-0 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
