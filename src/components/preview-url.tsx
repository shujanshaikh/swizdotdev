"use client"
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";
import SandboxLoader from "./sanndbox-loader";
import { Skeleton } from "./ui/skeleton";

export default function PreviewUrl({ projectId }: { projectId: string }) {

  const { data: sandboxUrl, isLoading } = api.project.getSandboxUrl.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      refetchInterval: (query) => (query.state.data ? false : 10000),
      refetchOnWindowFocus: false,
      retry: 3,
    },
  );
  const [url, setUrl] = useState(sandboxUrl || "");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState<'preparing' | 'loading' | 'finalizing'>('preparing');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUrl(sandboxUrl || "");
    if (sandboxUrl && iframeRef.current) {
      setIsIframeLoading(true);
      setLoadingPhase('loading');
      iframeRef.current.src = sandboxUrl;

      
      const phaseTimer = setTimeout(() => {
        setLoadingPhase('finalizing');
      }, 1500);

      return () => clearTimeout(phaseTimer);
    } else if (!sandboxUrl && !isLoading) {
      setLoadingPhase('preparing');
    }
  }, [sandboxUrl, isLoading]);



  const handleIframeLoad = () => {
    setIsIframeLoading(false);
    setLoadingPhase('finalizing');
  };

  
  const MinimalLoading = () => {
    const tips = [
      "Preparing preview",
      "Warming up sandbox",
      "Almost there"
    ];
    const [idx, setIdx] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setIdx((i) => (i + 1) % tips.length), 1400);
      return () => clearInterval(t);
    }, []);

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90">
        <div className="w-full max-w-sm px-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-200">Loading preview</div>
                  <div className="text-[11px] text-zinc-500">{tips[idx]}…</div>
                </div>
              </div>

              <div className="mt-4">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  if (isLoading || !sandboxUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
        <SandboxLoader />
      </div>
    );
  }



  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className={`relative h-full w-full ${isMobileView ? 'flex items-center justify-center p-4' : ''}`}>
        {isMobileView ? (
          <div className="flex items-center justify-center w-full h-full">
            <iframe
              ref={iframeRef || null}
              src={url || undefined}
              className="w-full h-full max-w-sm border-none rounded-lg"
              style={{
                width: '375px',
                height: '812px',
              }}
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl border border-zinc-200/50">
            
            <div className="relative h-full w-full">
              {/* Browser Header */}
              <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 bg-zinc-100/80 backdrop-blur-sm border-b border-zinc-200/50 flex items-center justify-between px-3 sm:px-4 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="ml-3 px-3 py-1 bg-white/60 rounded-md text-xs text-zinc-600 font-medium">
                    localhost:3000
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-zinc-300 rounded-full"></div>
                  <div className="w-4 h-1 bg-zinc-300 rounded-full"></div>
                  <div className="w-4 h-1 bg-zinc-300 rounded-full"></div>
                </div>
              </div>

            
              <div className="pt-10 sm:pt-12 h-full">
                <iframe
                  ref={iframeRef}
                  src={url || undefined}
                  className="w-full h-full border-none"
                  style={{ width: '100%', height: '100%' }}
                  onLoad={handleIframeLoad}
                />
              </div>

             
              <div className="absolute inset-0 pointer-events-none shadow-inner rounded-2xl"></div>
            </div>
          </div>
        )}
      </div>

      
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-zinc-900/60 backdrop-blur-sm rounded-lg border border-zinc-700/50">
          
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
              isMobileView
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                : 'bg-zinc-800/30 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300'
            }`}
            onClick={() => setIsMobileView(!isMobileView)}
            title={isMobileView ? "Switch to desktop view" : "Switch to mobile view"}
          >
            {isMobileView ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
          </Button>

          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-zinc-800/30 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-300 rounded-lg border-0 transition-all duration-200"
            onClick={() => window.open(url, "_blank")}
            title="Open in new tab"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>

          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-zinc-800/30 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-300 rounded-lg border-0 transition-all duration-200"
            onClick={() => {
              if (iframeRef.current) {
                setIsIframeLoading(true);
                setLoadingPhase('loading');
                iframeRef.current.src = iframeRef.current.src;
              }
            }}
            title="Refresh preview"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

        {isIframeLoading && (
          <MinimalLoading />
        )}
    </div>
  );
}

