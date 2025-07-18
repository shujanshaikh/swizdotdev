import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import type { Attachment } from "ai";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";

export default function MessageBox({
    input, status, handleInputChange, handleSubmit
}: {
    input: string;
    status: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, options: {
        experimental_attachments: Attachment[];
    }) => void;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
        <form onSubmit={event => {
      handleSubmit(event , {
        experimental_attachments: attachments,
      })
    }} className="relative max-w-3xl mx-auto">

      <div className={cn(
        "relative w-full rounded-2xl bg-zinc-800 transition-all duration-300 ease-in-out border",
        isFocused ? "border-white/30" : "border-zinc-700 hover:border-zinc-600/50",
        "backdrop-blur-sm"
      )}>
        {/* Attachments inside message box */}
        {attachments.length > 0 && (
          <div className="p-4 pb-2 border-b border-zinc-700/50">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group flex items-center bg-zinc-750 rounded-xl p-2 border border-zinc-600/50 max-w-[200px]">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                      {attachment.contentType?.startsWith('image/') ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.name || 'attachment'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-zinc-300 truncate">
                      {attachment.name || 'Unnamed file'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="ml-2 w-5 h-5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={input}
          onChange={handleTextareaChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Tell swiz what you want to do..."
          className={cn(
            "w-full min-h-[96px] max-h-[200px] p-6 pr-20 rounded-2xl bg-transparent text-white placeholder:text-zinc-400",
            "text-lg resize-none overflow-hidden leading-relaxed",
            "focus:outline-none transition-all duration-200",
            "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent",
            attachments.length > 0 ? "rounded-t-none pt-4" : ""
          )}
          ref={textareaRef}
        />
        
        <div className="absolute left-3 bottom-3">
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
                if(!res) return;
                const newAttachments = res.map((file) => ({
                  name: file.name,
                  url: file.ufsUrl,
                  contentType: file.type,
                }));
                setAttachments(prev => [...prev, ...newAttachments]);
            }}
            onUploadError={(error: Error) => {
              console.log(error);
            }}
            appearance={{
              button: cn(
                "w-8 h-8 bg-zinc-900 hover:bg-zinc-600 text-zinc-300 hover:text-white rounded-md",
                " transition-all duration-200",
                "flex items-center justify-center text-sm font-medium",
                "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-800"
              ),
              allowedContent: "hidden"
            }}
            content={{
              button: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )
            }}
          />
        </div>

        <Button 
          type="submit"
          disabled={status !== "ready" || !input.trim()}
          className={cn(
            "absolute right-3 bottom-3 w-8 h-8 bg-white hover:bg-white/90 text-black rounded-full",
            "border-none flex items-center justify-center transition-all duration-200",
            "disabled:opacity-40 disabled:cursor-not-allowed select-none focus:outline-none",
            "hover:scale-105 active:scale-95",
            status !== "ready" || !input.trim() ? "" : "hover:bg-gray-100"
          )}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform duration-200"
          >
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </Button>
      </div>
    </form>
  );
}