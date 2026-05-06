import { MockupWorkspaceStage } from "@/components/mockup-workspace-stage";
import { WorkspaceCanvasToolbar } from "@/components/workspace-canvas-toolbar";

export default function NewProjectPage() {
  return (
    <div className="relative grid min-h-full w-full place-items-center px-[72px] py-10">
      <WorkspaceCanvasToolbar className="pointer-events-auto absolute top-10 left-1/2 z-10 -translate-x-1/2" />
      <MockupWorkspaceStage />
    </div>
  );
}
