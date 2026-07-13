import StatCard from "@/components/cards/StatCard";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function OfferteStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isActive = false,
  subtitleColor = "text-green-500",
}) {
  return (
    <StatCard
      title={title}
      value={value}
      subtitle={subtitle}
      icon={Icon}
      isActive={isActive}
      subtitleColor={subtitleColor}
    />
  );
}

// Predefined card configs for quotes management
export const OfferteStatCards = ({ stats = {} }) => {
  const {
    totalQuotes = 0,
    approvedQuotes = 0,
    pendingQuotes = 0,
    newQuotes = 0,
  } = stats;

  return (
    <>
      <OfferteStatCard
        title="Totaal Offertes"
        value={totalQuotes}
        subtitle={`${approvedQuotes} goedgekeurd`}
        icon={FileText}
        isActive={true}
      />
      <OfferteStatCard
        title="In Behandeling"
        value={pendingQuotes}
        subtitle="Wachten op beoordeling"
        icon={Clock}
        subtitleColor="text-amber-600"
      />
      <OfferteStatCard
        title="Nieuwe Aanvragen"
        value={newQuotes}
        subtitle="Recent ontvangen"
        icon={AlertCircle}
        subtitleColor="text-destructive"
      />
      <OfferteStatCard
        title="Goedgekeurd"
        value={approvedQuotes}
        subtitle="Klant akkoord"
        icon={CheckCircle}
        subtitleColor="text-success"
      />
    </>
  );
};
