import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export default function MessageBox({
    input, status, handleInputChange, handleSubmit
}: {
    input: string;
    status: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  
  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
      <div className={cn(
        "relative w-full rounded-2xl bg-zinc-800 transition-all duration-300 ease-in-out",
        isFocused ? "border-white/30" : "hover:border-zinc-600/50",
        "backdrop-blur-sm bg-zinc-800/90"
      )}>
        <textarea
          value={input}
          onChange={handleTextareaChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="create a booking system for appointments with calendar integration..."
          className={cn(
            "w-full min-h-[96px] max-h-[200px] p-6 pr-12 rounded-2xl bg-transparent text-white placeholder:text-zinc-400",
            "text-lg resize-none overflow-hidden leading-relaxed",
            "focus:outline-none transition-all duration-200",
            "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
          )}
          ref={textareaRef}
        />
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