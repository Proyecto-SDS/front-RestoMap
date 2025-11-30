import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  icon: LucideIcon;
  iconColor: string; // ej: "text-blue-500"
  iconBg: string; // ej: "bg-blue-100"
}

export function StatCard({
  title,
  value,
  trend,
  trendUp,
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      {(trend || subtext) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`flex items-center font-medium ${
                trendUp ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {trend}
            </span>
          )}
          <span className="text-muted-foreground">{subtext}</span>
        </div>
      )}
    </Card>
  );
}
