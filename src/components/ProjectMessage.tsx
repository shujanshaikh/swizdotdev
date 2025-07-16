import type { UIMessage } from "ai";


export default function ProjectMessageView({messages}
    : {messages: Array<UIMessage>}) {

    return (
        <div className="w-full h-full bg-zinc-900/50 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                    No messages yet. Start a conversation!
                </div>
            ) : (
                messages.map((message) => (
                    <div key={message.id} className="border-b border-zinc-700/50 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                                message.role === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-green-600 text-white'
                            }`}>
                                {message.role}
                            </div>
                            {message.createdAt && (
                                <span className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        <div className="text-gray-300 space-y-2">
                            {message.parts?.map((part, index) => (
                                <div key={index} className="bg-zinc-800/50 p-2 rounded text-sm">
                                    <div className="text-xs text-gray-400 mb-1">
                                        {part.type}
                                    </div>
                                    {part.type === 'text' && (
                                        <p className="whitespace-pre-wrap">{part.text}</p>
                                    )}
                                    {part.type !== 'text' && (
                                        <pre className="text-xs overflow-x-auto">
                                            {JSON.stringify(part, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )) ?? (
                                <div className="text-gray-400 text-sm">No content</div>
                            )}
                        </div>
                        {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                            <div className="mt-2 text-sm text-gray-400">
                                Attachments: {message.experimental_attachments.length}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>  
    )
}