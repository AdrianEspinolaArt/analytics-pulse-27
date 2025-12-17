// Qualidade de Conteúdo - Content Quality Dashboard

import { LessonReportsSection } from "@/components/analytics/LessonReportsSection";
import { RemovedSubscriptionsSection } from "@/components/analytics/RemovedSubscriptionsSection";
import { SurveysSection } from "@/components/analytics/SurveysSection";

const QualidadeConteudo = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Qualidade de Conteúdo</h1>
        <p className="text-muted-foreground">
          Métricas e análises sobre a qualidade do conteúdo publicado
        </p>
         <div>
        <h2 className="text-2xl font-semibold mb-4">Feedback de Telas</h2>
        <SurveysSection />
      </div>
      </div>

      {/* Divider */}
      <div className="border-t my-8" />

      {/* Removed Subscriptions Section */}
      <RemovedSubscriptionsSection />

      {/* Divider */}
      <div className="border-t my-8" />

      {/* Surveys Section (Screen Feedback) */}
     
    </div>
  );
};

export default QualidadeConteudo;
