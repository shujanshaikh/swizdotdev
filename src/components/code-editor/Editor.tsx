import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import CodeEditor from "./Code-editor";
import CodeSidebar from "./Code-Sidebar";
import { type ToolCallFile } from "~/lib/types";



interface EditorProps {
  code_edit: string;
  relative_file_path: string;
  onFileChange?: (filePath: string, content: string) => void;
  editedFiles?: ToolCallFile[];
}

export default function Editor({
  code_edit,
  relative_file_path,
  onFileChange,
  editedFiles = [],
}: EditorProps) {
  const [currentFile, setCurrentFile] = useState(relative_file_path);
  const [currentContent, setCurrentContent] = useState(code_edit);

  useEffect(() => {
    if (relative_file_path && code_edit) {
      setCurrentFile(relative_file_path);
      setCurrentContent(code_edit);
      return;
    }

    if (!relative_file_path && editedFiles.length > 0) {
      const last = editedFiles[editedFiles.length - 1]!;
      setCurrentFile(last?.relative_file_path ?? "");
      setCurrentContent(last?.code_edit ?? "");
      return;
    }

    setCurrentFile("");
    setCurrentContent("");
  }, [code_edit, relative_file_path, editedFiles]);

  const handleFileSelect = (filePath: string) => {
    const fileData = editedFiles.find(file => file.relative_file_path === filePath);
    const content = fileData?.code_edit || `// File: ${filePath}\n// Content not available`;
    
    setCurrentFile(filePath);
    setCurrentContent(content);
    onFileChange?.(filePath, content);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="flex h-full w-full flex-col">
          <CodeSidebar 
            relative_file_path={currentFile} 
            onFileSelect={handleFileSelect}
            editedFiles={editedFiles}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle={false} />
      <ResizablePanel defaultSize={80} minSize={70} maxSize={85}>
        <CodeEditor code_edit={currentContent} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
