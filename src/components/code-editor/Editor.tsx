import { ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup, } from "../ui/resizable";


export default function Editor() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel>
        <div className="flex h-full w-full flex-col">
            <h1>Editor</h1>
          <ResizableHandle withHandle={false} />
        </div>
      </ResizablePanel>
      <ResizablePanel>
        <h1>Preview</h1>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}