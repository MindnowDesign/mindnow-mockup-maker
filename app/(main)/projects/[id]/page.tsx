import { MockupWorkspaceStage } from "@/components/mockup-workspace-stage";
import { WorkspaceCanvasToolbar } from "@/components/workspace-canvas-toolbar";
import { WorkspaceVisualsFloatingBar } from "@/components/workspace-visuals-floating-bar";

export default function ProjectByIdPage() {
  return (
    <div className="relative grid min-h-full w-full place-items-center px-[72px] py-10">
      <WorkspaceCanvasToolbar className="pointer-events-auto absolute top-10 left-1/2 z-40 -translate-x-1/2" />
      <WorkspaceVisualsFloatingBar className="absolute top-10 right-6 z-20 hidden md:flex" />
      <MockupWorkspaceStage />
    </div>
  );
}
