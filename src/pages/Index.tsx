// Analytics Dashboard - Main page
// Complete analytics dashboard with beautiful design

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-analytics-bg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default Index;