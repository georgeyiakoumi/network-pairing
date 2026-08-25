'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Heart, Users, Network, LayoutDashboard, FlaskConical } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Match', href: '/match', icon: Heart },
  { label: 'Connections', href: '/connections', icon: Users },
]

export function AppSidebar({ adminKey }: { adminKey?: string }) {
  const pathname = usePathname()

  // Admin links no longer carry ?key= — cookie is set on first visit
  const adminItems = adminKey
    ? [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Match tester', href: '/admin/test-match', icon: FlaskConical },
      ]
    : []

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <Network className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-semibold text-sm truncate group-data-[collapsible=icon]:hidden">
            AlumniConnect
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={label}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render={<Link href={href as any} />}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminItems.length > 0 && (
          <SidebarGroup className="hidden md:flex">
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(({ label, href, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={pathname === href.split('?')[0]}
                      tooltip={label}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      render={<Link href={href as any} />}
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  )
}
