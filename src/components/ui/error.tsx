import { AlertCircle } from "lucide-react";

interface ErrorProps {
  message: string;
}

export default function Error({ message }: ErrorProps) {
  return (
    <div className="rounded-lg bg-red-950/30 px-4 py-3 my-2 border border-red-900/50 shadow-sm">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-300">Error</h3>
          <div className="mt-1 text-sm text-red-400/90">
            {message || "An unexpected error occurred"}
          </div>
        </div>
      </div>
    </div>
  );
}
