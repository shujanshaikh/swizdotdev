"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import MessageBox from "./Message-box";


export default function Chat({
  id,
  initialMessages,
}: {
  id: string,
  initialMessages: Array<UIMessage>;
}) {
  const { input, status, handleInputChange, handleSubmit } = useChat({
    id,
    initialMessages,
    generateId : () => crypto.randomUUID(),
    api: "/api/agent",
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      id,
    }),
    sendExtraMessageFields: true,
    maxSteps: 3,
  });

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-white/20 flex items-center justify-center p-4 select-none pb-100 relative">
      <div className="absolute top-10 left-10 text-white font-semibold text-2xl z-10">
        swiz
      </div>
      
      <div className="w-full max-w-4xl text-center">
       
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 select-none">
          Make anything
        </h1>

     
        <p className="text-lg text-gray-400 mb-12 select-none">
          Build fullstack web apps by prompting
        </p>

        
       
          <MessageBox 
            input={input}
            status={status}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
       
      </div>
    </div>
  );
}
