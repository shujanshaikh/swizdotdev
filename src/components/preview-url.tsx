"use client"
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";

export default function PreviewUrl({ projectId }: { projectId: string }) {
  const { data: sandboxUrl, isLoading } = api.project.getSandboxUrl.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      refetchInterval: (query) => (query.state.data ? false : 2000),
      refetchOnWindowFocus: false,
      retry: 3,
    },
  );
  const [url, setUrl] = useState(sandboxUrl || "");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(sandboxUrl || "");
    if (sandboxUrl && iframeRef.current) {
      setIsIframeLoading(true);
      iframeRef.current.src = sandboxUrl;
    }
  }, [sandboxUrl]);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-900/5">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"></div>
          <p className="text-gray-400 text-xs">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-900/5">
        <p className="text-gray-400 text-xs">No preview available</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-900/5">
      <div className={`h-full w-full ${isMobileView ? 'flex items-center justify-center p-4' : ''}`}>
        {isMobileView ? (
          <div className="relative w-[375px] h-[812px] rounded-[2.5rem] border-4 border-zinc-700 shadow-2xl overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-none rounded-[2.5rem]"
              style={{ width: '375px', height: '812px' }}
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-none"
              style={{ width: '100%', height: '100%' }}
              onLoad={handleIframeLoad}
            />
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 bg-zinc-900/90 hover:bg-zinc-700/90 text-white rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all duration-200"
          onClick={() => setIsMobileView(!isMobileView)}
          title={isMobileView ? "Switch to desktop view" : "Switch to mobile view"}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileView ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            )}
          </svg>
          <span className="text-xs font-medium">{isMobileView ? "Desktop" : "Mobile"}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 bg-zinc-900/90 hover:bg-zinc-700/90 text-white rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all duration-200"
          onClick={() => window.open(url, "_blank")}
          title="Open in new tab"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="text-xs font-medium">Open</span>
        </Button>
      </div>

        {isIframeLoading && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 bg-zinc-900/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <p className="text-xs">Loading the preview...</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
