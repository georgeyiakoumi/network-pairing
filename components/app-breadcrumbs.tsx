'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const ROUTE_LABELS: Record<string, string> = {
  '/match': 'Match',
  '/connections': 'Connections',
  '/admin': 'Dashboard',
  '/admin/test-match': 'Match tester',
  '/onboarding': 'Onboarding',
  '/onboarding/direct': 'Direct',
  '/onboarding/guided': 'Guided',
}

const ROUTE_PARENTS: Record<string, { label: string; href: string }[]> = {
  '/admin': [{ label: 'Admin', href: '/admin' }],
  '/admin/test-match': [{ label: 'Admin', href: '/admin' }],
  '/onboarding/direct': [{ label: 'Onboarding', href: '/onboarding' }],
  '/onboarding/guided': [{ label: 'Onboarding', href: '/onboarding' }],
}

export function AppBreadcrumbs({ adminKey }: { adminKey?: string }) {
  const pathname = usePathname()

  const label = ROUTE_LABELS[pathname]
  if (!label) return null

  const parents = ROUTE_PARENTS[pathname] ?? []

  function resolveHref(href: string) {
    if (adminKey && href.startsWith('/admin')) {
      return `${href}?key=${adminKey}`
    }
    return href
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parents.map((parent, i) => (
          <Fragment key={i}>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={resolveHref(parent.href) as never} />}>
                {parent.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
