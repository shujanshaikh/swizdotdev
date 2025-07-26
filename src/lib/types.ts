export interface FileType {
    name: string
    type: "file" | "directory"
    isOpen?: boolean
    children?: FileType[]
    path: string
}

export interface FileEdit {
    relative_file_path: string
    code_edit: string
    instructions: string
    timestamp: Date
    toolName: string
}

export interface ToolCallFile {
    relative_file_path: string
    code_edit: string
    instructions: string
}

export interface CodeMapping {
    currentFile: FileEdit | null
    editHistory: FileEdit[]
    fileList: Set<string>
}