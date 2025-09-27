"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SiReact } from "@icons-pack/react-simple-icons"
import { Skeleton } from "~/components/ui/skeleton"

type Props = {
  label?: string
  className?: string
}

const mockCode = `
const Button = () => {
  return <button>Click me</button>
}
`

const loadingMessages = [
  "Preparing sandbox preview…",
  "Loading the preview please wait...",
  "Generating the code"
]

export function SandboxLoader({ label = "Loading the sandbox...", className }: Props) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 4000) // Change message every 2 seconds

    return () => clearInterval(interval)
  }, [])
  const codeLineWidths = [
    "w-[88%]",
    "w-[76%]",
    "w-[92%]",
    "w-[70%]",
    "w-[82%]",
    "w-[64%]",
    "w-[78%]",
  ]

  const shadcnTabs = ["button.tsx", "card.tsx", "dialog.tsx"]

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={[
        "relative flex flex-col min-h-[320px] min-w-[340px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80",
        className,
      ].join(" ")}
    >
     
      <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/90"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/90"></div>
        </div>
        <div className="flex-1"></div>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>

      
      <div className="relative flex-1 flex gap-0">
        
        <div className="relative w-[60%] border-r border-zinc-800/70">
          <div className="h-full p-3">
            
            <div className="mb-3 flex items-center gap-2">
              {shadcnTabs.map((name) => (
                <div key={name} className="relative min-w-[90px]">
                  <Skeleton className="h-5 w-full rounded-sm" />
                  <div className="absolute inset-0 flex items-center gap-1 px-1.5">
                    <SiReact size={10} color="#149ECA" />
                    <span className="text-[10px] text-zinc-300">{name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {codeLineWidths.map((width, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-6 rounded-sm" />
                  <Skeleton className={["h-3 rounded-sm", width].join(" ")} />
                </div>
              ))}
            </div>
          </div>
          
         
        </div>

        
        <div className="relative w-[40%]">
          <div className="h-full p-3">
            <div className="relative h-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-900/40">
              
              <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-zinc-950/30 px-2 py-1.5">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500/80"></span>
                  <span className="h-2 w-2 rounded-full bg-yellow-500/80"></span>
                  <span className="h-2 w-2 rounded-full bg-green-500/80"></span>
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-3 rounded" />
                </div>
                <div className="flex-1 px-2">
                  <Skeleton className="mx-auto h-4 w-full max-w-[120px] rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-8 rounded" />
                  <Skeleton className="h-3 w-6 rounded" />
                </div>
              </div>

              
              <div className="p-2">
                <Skeleton className="h-20 w-full rounded-md" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Skeleton className="h-14 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </div>

              
              <Skeleton className="absolute right-1 top-12 h-8 w-0.5 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      
      <div className="relative border-t border-zinc-800/70 bg-zinc-900/40">
        <div className="h-1.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[progress_1.8s_ease-in-out_infinite] bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"></div>
        </div>
        <div className="px-4 py-2 text-[11px] text-zinc-400">
          {loadingMessages[currentMessageIndex]}
        </div>
      </div>

      <span className="sr-only">{label}</span>

      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(380%); }
        }
      `}</style>
    </div>
  )
}

export default SandboxLoader
