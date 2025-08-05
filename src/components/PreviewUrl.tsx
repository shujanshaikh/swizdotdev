import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button"
import { api } from "~/trpc/react";

export default function PreviewUrl({ projectId }: { projectId: string }) {
    const { data: sandboxUrl } = api.project.getSandboxUrl.useQuery({ projectId } , {
        enabled: !!projectId
    });
    const [url, setUrl] = useState(sandboxUrl || "");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    useEffect(() => {
        setUrl(sandboxUrl || "");
        if (sandboxUrl && iframeRef.current) {
            iframeRef.current.src = sandboxUrl;
        }
    }, [sandboxUrl]);

    const handleRefresh = () => {
        if (iframeRef.current && url) {
            iframeRef.current.src = url;
        }
    };

    const handleOpenInNewTab = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="bg-zinc-900/50 px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="p-1.5 h-auto hover:bg-zinc-800">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1.5 h-auto hover:bg-zinc-800">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1.5 h-auto hover:bg-zinc-800"
                        onClick={handleRefresh}
                        disabled={!url}
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </Button>
                </div>

                <div className="flex-1 flex items-center bg-zinc-800 border border-white rounded-full px-4 py-1.5">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input 
                        type="text" 
                        className="flex-1 outline-none text-sm text-white bg-transparent placeholder:text-gray-400"
                        placeholder={url ? "Website is loaded" : "Enter URL to preview"}
                        value=""
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1.5 h-auto hover:bg-zinc-800"
                        onClick={handleOpenInNewTab}
                        disabled={!url}
                        title="Open in new tab"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                {url ? (
                    <iframe  
                        ref={iframeRef}
                        width="100%" 
                        height="100%" 
                        src={url} 
                        className="border-none w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900/20">
                        <div className="text-center text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            <p className="text-lg font-medium">No URL to preview</p>
                            <p className="text-sm">Enter a URL in the address bar above</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}