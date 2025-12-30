import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-[#00dee8] animate-spin" />
      <p className="text-muted-foreground animate-pulse">Loading UniSell...</p>
    </div>
  );
}
