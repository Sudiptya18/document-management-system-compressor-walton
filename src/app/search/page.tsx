import { SearchWorkspace } from "@/components/search-workspace";
import { SiteHeader } from "@/components/site-header";

export default function SearchPage() {
  return (
    <>
      <SiteHeader active="search" />
      <main className="flex-1">
        <SearchWorkspace />
      </main>
    </>
  );
}
