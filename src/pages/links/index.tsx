import { useState } from "react";
import { useLocation } from "react-router-dom";
import { LinksTopBar } from "./components/links-top-bar";
import { StatRow } from "./components/stat-row";
import { SearchBar } from "./components/search-bar";
import { LinksTable } from "./components/links-table";
import { NewLinkModal } from "./components/new-link-modal";

export default function LinksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");

  return (
    <div className="flex min-h-screen flex-col">
      <LinksTopBar onNewLink={() => setModalOpen(true)} isDemo={isDemo} />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        <StatRow />
        <SearchBar />
        <LinksTable onNewLink={() => setModalOpen(true)} />
      </div>
      <NewLinkModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
