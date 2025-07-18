import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import type { Attachment } from "ai";
import { UploadButton } from "~/utils/uploadthing";
import Image from "next/image";
import { Paperclip } from "lucide-react";




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
        "relative w-full rounded-3xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 transition-all duration-300 ease-in-out border backdrop-blur-md shadow-2xl"
      )}>
        {/* Attachments inside message box */}
        {attachments.length > 0 && (
          <div className="p-4 pb-3 border-b border-zinc-600/30">
            <div className="flex flex-wrap gap-3">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group flex items-center bg-zinc-750/60 rounded-2xl p-3 border border-zinc-600/40 max-w-[220px] hover:bg-zinc-700/60 transition-all duration-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-zinc-700/50 flex-shrink-0 ring-1 ring-zinc-600/30">
                      {attachment.contentType?.startsWith('image/') ? (
                        <Image
                          src={attachment.url}
                          alt={attachment.name || 'attachment'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-zinc-200 truncate font-medium">
                      {attachment.name || 'Unnamed file'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="ml-2 w-6 h-6 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:scale-110"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            "w-full min-h-[100px] max-h-[200px] p-6 pr-28 rounded-3xl bg-transparent text-white placeholder:text-zinc-400",
            "text-lg resize-none overflow-hidden leading-relaxed font-medium",
            "focus:outline-none transition-all duration-200",
            "scrollbar-thin scrollbar-thumb-zinc-500/50 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400/60",
            attachments.length > 0 ? "rounded-t-none pt-5" : ""
          )}
          ref={textareaRef}
        />
        
                <div className="absolute left-4 bottom-4">
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
                "w-8 h-8 bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg",
                "transition-all duration-200 hover:scale-105 active:scale-95",
                "flex items-center justify-center border-none",
                "focus:outline-none"
              ),
              allowedContent: "hidden"
            }}
            content={{
              button: (
                <Paperclip className="w-5 h-5" />
              )
            }}
          />
        </div>

        <Button 
          type="submit"
          disabled={status !== "ready" || !input.trim()}
          className={cn(
            "absolute right-4 bottom-4 w-10 h-10 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-zinc-800 rounded-full",
            "border-none flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 select-none focus:outline-none",
            "hover:scale-105 active:scale-95 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-zinc-800",
            status !== "ready" || !input.trim() ? "from-zinc-200 to-zinc-300 hover:from-zinc-200 hover:to-zinc-300" : ""
          )}
        >
          <svg 
            width="14" 
            height="14" 
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