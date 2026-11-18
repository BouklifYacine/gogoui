import {
  CalendarIcon,
  FileTextIcon,
  HouseIcon,
  UsersIcon,
} from '@phosphor-icons/react'

import preview from '#.storybook/preview'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar.tsx'

const pages = [
  { label: 'Accueil', icon: HouseIcon, active: true },
  { label: 'Calendrier', icon: CalendarIcon },
  { label: 'Clients', icon: UsersIcon },
  { label: 'Factures', icon: FileTextIcon },
]

const meta = preview.meta({
  title: 'Composants/Sidebar',
  component: SidebarProvider,
  parameters: { layout: 'fullscreen' },
})

/**
 * The app's menu: a column on a computer, folded to icons with the
 * trigger, a sheet opened by « Menu » on a phone.
 *
 * @summary The application's side menu with its page.
 */
export const Basic = meta.story({
  render: () => (
    <SidebarProvider className="min-h-96">
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-4 py-3 text-sm font-medium">
          Mon lieu
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.map(({ label, icon: Icon, active }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton isActive={active} tooltip={label}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Accueil</span>
        </header>
        <main className="p-4 text-sm text-fg-muted">
          Le contenu de la page.
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})
