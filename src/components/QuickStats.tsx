import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

interface QuickStatsProps {
  language: 'bn' | 'en';
}

export const QuickStats = ({ language }: QuickStatsProps) => {
  const stats = [
    {
      title: language === 'bn' ? 'সম্পূর্ণ ফর্ম' : 'Completed Forms',
      value: '12',
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: language === 'bn' ? 'চলমান আবেদন' : 'Pending Applications',
      value: '3',
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: language === 'bn' ? 'মনোযোগ প্রয়োজন' : 'Requires Attention',
      value: '1',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: language === 'bn' ? 'মোট নথি' : 'Total Documents',
      value: '28',
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-card hover:shadow-form transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-1 rounded ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};