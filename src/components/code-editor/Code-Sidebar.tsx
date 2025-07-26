import { useState, useMemo, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Database,
  Settings,
  Package,
  Lock,
  GitBranch,
  Zap,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { type ToolCallFile } from "~/lib/types";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  extension?: string;
}

interface CodeSidebarProps {
  relative_file_path: string;
  onFileSelect?: (filePath: string) => void;
  editedFiles?: ToolCallFile[];
}

function getFileIcon(extension?: string) {
  if (!extension) return FileText;
  
  switch (extension.toLowerCase()) {
    case "tsx":
    case "jsx":
    case "ts":
    case "js":
    case "vue":
    case "svelte":
      return FileCode;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
    case "ico":
      return FileImage;
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return FileVideo;
    case "mp3":
    case "wav":
    case "flac":
      return FileAudio;
    case "sql":
    case "db":
    case "sqlite":
      return Database;
    case "json":
    case "env":
    case "config":
    case "yaml":
    case "yml":
      return Settings;
    case "lock":
      return Lock;
    case "md":
    case "mdx":
      return FileText;
    case "zip":
    case "tar":
    case "gz":
      return Package;
    case "git":
      return GitBranch;
    case "sh":
    case "bash":
      return FileCode;
    case "css":
    case "scss":
    case "sass":
      return FileCode;
    default:
      return FileText;
  }
}

function buildFileTree(editedFiles: ToolCallFile[]): FileNode[] {
  const root: FileNode[] = [];
  const folderMap = new Map<string, FileNode>();

  
  const sortedFiles = [...editedFiles].sort((a, b) => 
    a.relative_file_path.localeCompare(b.relative_file_path)
  );

  sortedFiles.forEach(({ relative_file_path }) => {
    const parts = relative_file_path.split('/').filter(part => part.length > 0);
    let currentLevel = root;
    let currentPath = '';

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!part) continue;
      
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let existingFolder = currentLevel.find(node => node.name === part && node.type === 'folder');
      
      if (!existingFolder) {
        existingFolder = {
          name: part,
          path: currentPath,
          type: 'folder',
          children: []
        };
        currentLevel.push(existingFolder);
        folderMap.set(currentPath, existingFolder);
      }
      
      if (existingFolder.children) {
        currentLevel = existingFolder.children;
      }
    }

    const fileName = parts[parts.length - 1];
    if (!fileName) return;
    
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() || undefined : undefined;
    
    currentLevel.push({
      name: fileName,
      path: relative_file_path,
      type: 'file',
      extension: fileExtension
    });
  });

  const sortLevel = (nodes: FileNode[]): FileNode[] => {
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const sortRecursively = (nodes: FileNode[]): FileNode[] => {
    const sorted = sortLevel(nodes);
    sorted.forEach(node => {
      if (node.children) {
        node.children = sortRecursively(node.children);
      }
    });
    return sorted;
  };

  return sortRecursively(root);
}

function FileTreeNode({
  node,
  depth = 0,
  selectedFile,
  onFileSelect,
  expandedFolders,
  onToggleFolder,
}: {
  node: FileNode;
  depth?: number;
  selectedFile: string;
  onFileSelect?: (filePath: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderPath: string) => void;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;
  const IconComponent = node.type === "folder" 
    ? (isExpanded ? FolderOpen : Folder)
    : getFileIcon(node.extension);

  const handleClick = () => {
    if (node.type === "folder") {
      onToggleFolder(node.path);
    } else {
      onFileSelect?.(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 text-sm cursor-pointer rounded-md transition-all duration-200 hover:bg-white/5",
          "select-none",
          isSelected && "bg-white/20 text-white",
          !isSelected && "text-gray-300 hover:text-white"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" && (
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </div>
        )}
        {node.type === "file" && <div className="w-4" />}
        
        <IconComponent 
          className={cn(
            "w-4 h-4 flex-shrink-0",
            node.type === "folder" 
              ? (isExpanded ? "text-white" : "text-zinc-400")
              : "text-gray-400"
          )} 
        />
        
        <span className="truncate flex-1 ml-1">{node.name}</span>
      </div>
      
      {node.type === "folder" && isExpanded && node.children && (
        <div className="overflow-hidden">
          <div className="animate-in slide-in-from-top-2 duration-200">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodeSidebar({
  relative_file_path,
  onFileSelect,
  editedFiles = [],
}: CodeSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newFolders = new Set<string>();
    editedFiles.forEach(({ relative_file_path }) => {
      const parts = relative_file_path.split('/').filter(part => part.length > 0);
      let currentPath = '';
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!part) continue;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        newFolders.add(currentPath);
      }
    });
    setExpandedFolders(newFolders);
  }, [editedFiles]);

  const handleToggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const fileTree = useMemo(() => buildFileTree(editedFiles), [editedFiles]);

  if (editedFiles.length === 0) {
    return (
      <div className="w-full h-full bg-zinc-900/50 flex flex-col items-center justify-center">
        <div className="text-center p-4">
          <FileCode className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No files created yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Files will appear here when created by the agent
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900/50 flex flex-col">
      <div className="flex-shrink-0 p-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Generated Files</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-2">
          {fileTree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedFile={relative_file_path}
              onFileSelect={onFileSelect}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 p-2 bg-zinc-900/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{editedFiles.length} files created</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}