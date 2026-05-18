import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, ShieldAlert } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  if (status === "An tâm") {
    return (
      <Badge variant="success" className="border-emerald-200/50 dark:border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        An tâm
      </Badge>
    );
  }
  if (status === "Dao động") {
    return (
      <Badge variant="warning" className="border-amber-200/50 dark:border-amber-500/20">
        <Activity className="w-3 h-3" />
        Dao động
      </Badge>
    );
  }
  if (status === "Nguy cơ") {
    return (
      <Badge variant="destructive" className="border-red-200/50 dark:border-red-500/20">
        <ShieldAlert className="w-3 h-3" />
        Nguy cơ
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}
