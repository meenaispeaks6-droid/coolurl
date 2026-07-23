import { IconMenu2 } from "@tabler/icons-react";
import {
  SidebarMenuButton,
  SidebarHoverArea,
  usePeekable,
  useShadcnSidebar,
} from "@/components/base/sidebar";

function Header() {
  const { state, actions } = usePeekable();
  const { setOpenMobile } = useShadcnSidebar();

  return (
    <header className="relative z-20 flex h-11 shrink-0 items-center gap-2 px-4 pointer-events-auto">
      {!state.isExpanded && (
        <SidebarHoverArea className="hidden md:block">
          <SidebarMenuButton size="sm" onClick={() => actions.expand("hamburger")}>
            <IconMenu2 />
          </SidebarMenuButton>
        </SidebarHoverArea>
      )}
      <SidebarMenuButton
        size="sm"
        className="md:hidden"
        onClick={() => setOpenMobile(true)}
      >
        <IconMenu2 />
      </SidebarMenuButton>
      <span className="text-sm font-medium">Home</span>
    </header>
  );
}

export default function Workspace() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Workspace</h1>
      </main>
    </div>
  );
}
