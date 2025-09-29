import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: 'pending' | 'completed' | 'in-progress';
  actionText: string;
  onAction: () => void;
  priority?: boolean;
}

export const DashboardCard = ({
  title,
  description,
  icon: Icon,
  status,
  actionText,
  onAction,
  priority = false
}: DashboardCardProps) => {
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'সম্পূর্ণ';
      case 'in-progress': return 'চলমান';
      case 'pending': return 'অপেক্ষমাণ';
      default: return '';
    }
  };

  return (
    <Card className={`shadow-card hover:shadow-form transition-all duration-300 hover:scale-[1.02] ${
      priority ? 'ring-2 ring-primary ring-opacity-20' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-card-foreground">
                {title}
              </CardTitle>
            </div>
          </div>
          {status && (
            <Badge variant={getStatusVariant(status)} className="text-xs">
              {getStatusText(status)}
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={onAction}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          size="sm"
        >
          {actionText}
        </Button>
      </CardContent>
    </Card>
  );
};