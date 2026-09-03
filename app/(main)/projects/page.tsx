import { ProjectsPageContent } from "@/components/projects-page-content";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="w-full flex-1 px-[72px] py-10">
        <ProjectsPageContent />
      </div>
    </div>
  );
}
