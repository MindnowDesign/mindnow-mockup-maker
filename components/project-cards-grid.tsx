import { ProjectProductCard } from "@/components/project-product-card";
import { StartFromScratchCard } from "@/components/start-from-scratch-card";

/** Same grid as the home “My projects” section — create tile + project tiles. */
export function ProjectCardsGrid() {
  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StartFromScratchCard aria-label="Create new project" />
      <ProjectProductCard title="Project Name" visualCount={4} />
      <ProjectProductCard title="Project Name" visualCount={12} />
    </div>
  );
}
