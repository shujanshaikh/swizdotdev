import z from 'zod/v3'

export const dataPartSchema = z.object({
    'edit-file': z.object({
        path: z.string(),
        content: z.string(),
        status: z.enum(['loading', 'done']),
    }),
    'grep': z.object({  
        pattern: z.string(),
        status: z.enum(['loading', 'done']),
    }),
    'ls': z.object({
        status: z.enum(['loading', 'done']),
    }),
    'glob': z.object({
        pattern: z.string(),
        status: z.enum(['loading', 'done']),
    }),
    'task-agent': z.object({
        status: z.enum(['loading', 'done']),
    }),
    'bash': z.object({
        command: z.string(),
        args: z.array(z.string()),
        status: z.enum(['loading', 'done']),
    }),
    'web-scraper': z.object({
        url: z.string(),
        status: z.enum(['loading', 'done']),
    }),
    'web-search': z.object({
        query: z.string(),
        status: z.enum(['loading', 'done']),
    }),
    'suggestion': z.object({
        status: z.enum(['loading', 'done']),
    }),
})

export type DataPart = z.infer<typeof dataPartSchema>