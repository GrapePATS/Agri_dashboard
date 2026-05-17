import { Lightbulb, ChevronRight } from 'lucide-react';

interface RecommendationCardProps {
  text: string;
}

export function RecommendationCard({ text }: RecommendationCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="shrink-0 bg-white/20 rounded-xl p-2">
          <Lightbulb size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-1">
            คำแนะนำ AI
          </p>
          <p className="text-sm leading-relaxed text-white">{text}</p>
        </div>
        <ChevronRight size={16} className="text-white/60 shrink-0 mt-1" />
      </div>
    </div>
  );
}
