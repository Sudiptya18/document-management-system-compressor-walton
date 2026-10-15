import { SaveWorkspace } from "@/components/save-workspace";
import { SiteHeader } from "@/components/site-header";

export default function SavePage() {
  return (
    <>
      <SiteHeader active="save" />
      <main className="flex-1">
        <SaveWorkspace />
      </main>
    </>
  );
}
