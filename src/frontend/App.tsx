
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "~/components/Chat";
import ProjectView from "~/components/ProjectView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat id={crypto.randomUUID()} initialMessages={[]} />} />
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </BrowserRouter>
  );
}