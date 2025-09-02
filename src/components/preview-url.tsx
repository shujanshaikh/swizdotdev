"use client"
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";

export default function PreviewUrl({ projectId }: { projectId: string }) {
  const { data: sandboxUrl, isLoading } = api.project.getSandboxUrl.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      // Poll until a URL is available, then stop
      refetchInterval: (query) => (query.state.data ? false : 2000),
      refetchOnWindowFocus: false,
      retry: 3,
    },
  );
  const [url, setUrl] = useState(sandboxUrl || "");
  const [isMobileView, setIsMobileView] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(sandboxUrl || "");
    if (sandboxUrl && iframeRef.current) {
      iframeRef.current.src = sandboxUrl;
    }
  }, [sandboxUrl]);

  // If polling is still running and we have no URL, show a subtle fetching indicator in the toolbar
  // Show loading state when query is loading
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col min-h-0">
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-zinc-900/50 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 sm:gap-3 sm:px-4">
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="h-6 w-6 animate-pulse rounded bg-zinc-700"></div>
            <div className="h-6 w-6 animate-pulse rounded bg-zinc-700"></div>
            <div className="h-6 w-6 animate-pulse rounded bg-zinc-700"></div>
          </div>
          <div className="flex flex-1 min-w-0 items-center rounded-full border border-white bg-zinc-800 px-3 py-1 sm:px-4 sm:py-1.5">
            <div className="mr-2 h-4 w-4 animate-pulse rounded bg-zinc-700"></div>
            <div className="flex-1 h-4 animate-pulse rounded bg-zinc-700"></div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="h-6 w-6 animate-pulse rounded bg-zinc-700"></div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <div className="flex h-full w-full items-center justify-center bg-zinc-900/20">
            <div className="text-center text-gray-400">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-zinc-700 border-t-white"></div>
              <p className="text-lg font-medium">Loading sandbox...</p>
              <p className="text-sm">Please wait while we prepare your preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message when no sandbox URL is available
  if (!sandboxUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900/20">
        <div className="text-center text-gray-400">
          <svg
            className="mx-auto mb-4 h-16 w-16 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
            />
          </svg>
          <p className="text-lg font-medium">No sandbox URL available</p>
          <p className="text-sm">Start a conversation to create a sandbox for this project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      

      <div className="flex-1 min-h-0">
        {url ? (
          <div className={`relative h-full w-full overflow-auto rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isMobileView ? 'flex items-center justify-center bg-zinc-900/10' : ''}`}>
            <div className={`relative ${isMobileView ? 'w-[393px] h-[852px] rounded-[2.5rem] border-4 border-zinc-700 shadow-2xl overflow-hidden' : 'h-full w-full'}`}>
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={url}
                className={`border-none ${isMobileView ? 'rounded-[2.5rem]' : 'rounded-2xl'}`}
                style={isMobileView ? { width: '393px', height: '852px' } : {}}
              />
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 bg-zinc-900/80 hover:bg-zinc-700/80 text-white rounded-2xl shadow-lg flex items-center gap-2 ${isMobileView ? 'bg-zinc-900/80 hover:bg-zinc-700/80' : ''}`}
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
                <span className="text-xs">{isMobileView ? "Desktop" : "Mobile"}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 bg-zinc-900/80 hover:bg-zinc-700/80 text-white rounded-2xl shadow-lg flex items-center gap-2"
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
                <span className="text-xs">Open</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900/20">
            <div className="text-center text-gray-400">
              <svg
                className="mx-auto mb-4 h-16 w-16 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                />
              </svg>
              <p className="text-lg font-medium">No URL to preview</p>
              <p className="text-sm">Start a conversation to create a sandbox for this project</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
