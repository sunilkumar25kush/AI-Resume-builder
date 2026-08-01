import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared wrapper so every auth page follows the same layout. */
export function AuthFormCard({ title, description, children, footer }: AuthFormCardProps) {
  return (
    <Card className="w-full border-0 bg-card/80 shadow-xl backdrop-blur sm:border">
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
      {footer ? <div className="px-6 pb-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </Card>
  );
}
