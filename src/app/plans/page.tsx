import { PageHeader } from "@/components/shared/PageHeader";
import { PlanSectionCard } from "@/components/modules/plans/PlanSectionCard";

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      <PageHeader 
         title="Plans" 
         description="Map out your roadmap across scopes without feeling overwhelmed." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
         <PlanSectionCard title="Daily Focus" scope="daily" delay={0.1} />
         <PlanSectionCard title="Weekly Sprint" scope="weekly" delay={0.2} />
         <PlanSectionCard title="Monthly Goals" scope="monthly" delay={0.3} />
      </div>
    </div>
  );
}
