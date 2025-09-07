import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import type { Monaco } from "@monaco-editor/react";
import type * as monacoEditor from "monaco-editor";

interface CodeEditorProps {
  code_edit: string;
}

export default function CodeEditor({ code_edit }: CodeEditorProps) {
  const [editorContent, setEditorContent] = useState("");
  const isMountedRef = useRef(true);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    setIsTouch(typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setEditorContent(code_edit);
  }, [code_edit]);

  const handleEditorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    console.log("Editor mounted successfully!");
    
    if (!isMountedRef.current) return;

    setTimeout(() => {
      if (!isMountedRef.current) return;
      
      try {
        monaco.editor.defineTheme("premium-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6A9955", fontStyle: "italic" },
            { token: "keyword", foreground: "C586C0" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
            { token: "regexp", foreground: "D16969" },
            { token: "type", foreground: "4EC9B0" },
            { token: "class", foreground: "4EC9B0" },
            { token: "function", foreground: "DCDCAA" },
            { token: "variable", foreground: "9CDCFE" },
            { token: "variable.predefined", foreground: "4FC1FF" },
            { token: "interface", foreground: "4EC9B0" },
            { token: "namespace", foreground: "4EC9B0" },
          ],
          colors: {
            "editor.background": "#101010",
            "editor.foreground": "#D4D4D4",
            "editorCursor.foreground": "#AEAFAD",
            "editor.lineHighlightBackground": "#2D2D30",
            "editorLineNumber.foreground": "#858585",
            "editor.selectionBackground": "#264F78",
            "editor.inactiveSelectionBackground": "#3A3D41",
            "editorIndentGuide.background": "#404040",
          },
        });

        monaco.editor.setTheme("premium-dark");

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.ESNext,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: "React",
          allowJs: true,
          typeRoots: ["node_modules/@types"],
        });

      } catch (error) {
        console.error("Failed to setup custom Monaco theme:", error);
      }
    }, 100);
  };

  return (
    <div className="h-full w-full rounded-md py-4">
      <Editor
        height="100%"
        width="100%"
        theme="premium-dark"
        defaultLanguage="typescript"
        value={editorContent}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-black/40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: isTouch ? 13 : 14,
          fontFamily: "Inter",
          fontWeight: "400",
          fontLigatures: true,
          cursorBlinking: isTouch ? "solid" : "blink",
          smoothScrolling: true,
          mouseWheelZoom: true,
          wordWrap: "on",
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: isTouch ? 12 : 10,
            horizontalScrollbarSize: isTouch ? 12 : 10,
          },
        }}
      />
    </div>
  );
}
