"use client"
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";

export default function PreviewUrl({ projectId }: { projectId: string }) {
  const { data: sandboxUrl, isLoading, refetch } = api.project.getSandboxUrl.useQuery(
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(sandboxUrl || "");
    if (sandboxUrl && iframeRef.current) {
      iframeRef.current.src = sandboxUrl;
    }
  }, [sandboxUrl]);

  // If polling is still running and we have no URL, show a subtle fetching indicator in the toolbar

  const handleRefresh = () => {
    // Manually refetch sandbox URL in case it just became available
    void refetch();
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

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
      <div className="flex h-full w-full flex-col min-h-0">
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-zinc-900/50 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 sm:gap-3 sm:px-4">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1.5 hover:bg-zinc-800"
              disabled
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1.5 hover:bg-zinc-800"
              disabled
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1.5 hover:bg-zinc-800"
              disabled
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>

          <div className="flex flex-1 min-w-0 items-center rounded-full border border-white bg-zinc-800 px-3 py-1 sm:px-4 sm:py-1.5">
            <svg
              className="mr-2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm text-gray-400 outline-none"
              placeholder="No sandbox URL available"
              value=""
              disabled
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1.5 hover:bg-zinc-800"
              disabled
            >
              <svg
                className="h-4 w-4 text-gray-500"
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
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-zinc-900/50 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 sm:gap-3 sm:px-4">
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1.5 hover:bg-zinc-800"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1.5 hover:bg-zinc-800"
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1.5 hover:bg-zinc-800"
            onClick={handleRefresh}
            disabled={!url}
          >
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </Button>
        </div>

        <div className="flex flex-1 min-w-0 items-center rounded-full border border-white bg-zinc-800 px-3 py-1 sm:px-4 sm:py-1.5">
          <svg
            className="mr-2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
            placeholder={url ? "Website is loaded" : "Enter URL to preview"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1.5 hover:bg-zinc-800"
            onClick={handleOpenInNewTab}
            disabled={!url}
            title="Open in new tab"
          >
            <svg
              className="h-4 w-4 text-white"
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
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {url ? (
          <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            src={url}
            className="h-full w-full border-none"
          />
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
              <p className="text-sm">Enter a URL in the address bar above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
