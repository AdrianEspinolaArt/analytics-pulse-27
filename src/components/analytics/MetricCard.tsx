// Analytics metric card component with gradient styling
// Displays key metrics with proper formatting

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'default';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  primary: "bg-gradient-to-br from-primary/5 to-primary-light/5 border-primary/20",
  success: "bg-gradient-to-br from-success/5 to-success-light/5 border-success/20", 
  warning: "bg-gradient-to-br from-warning/5 to-warning-light/5 border-warning/20",
  info: "bg-gradient-to-br from-info/5 to-info-light/5 border-info/20",
  default: "bg-analytics-card border-border",
};

const trendColors = {
  positive: "text-success bg-success/10 border-success/20",
  negative: "text-destructive bg-destructive/10 border-destructive/20", 
  neutral: "text-muted-foreground bg-muted border-muted",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  variant = 'default',
  icon,
  className,
}: MetricCardProps) {
  const TrendIcon = trend ? (
    trend.isPositive ? TrendingUp : 
    trend.value === 0 ? Minus : TrendingDown
  ) : null;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "h-4 w-4",
            variant === 'primary' && "text-primary",
            variant === 'success' && "text-success", 
            variant === 'warning' && "text-warning",
            variant === 'info' && "text-info",
            variant === 'default' && "text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {typeof value === 'number' 
            ? value.toLocaleString('pt-BR') 
            : value
          }
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              trend.isPositive 
                ? trendColors.positive
                : trend.value === 0 
                  ? trendColors.neutral
                  : trendColors.negative
            )}
          >
            {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
            {Math.abs(trend.value)}% {trend.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}