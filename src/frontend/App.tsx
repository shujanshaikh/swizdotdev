
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "~/components/Chat";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat id={crypto.randomUUID()} initialMessages={[]} />} />
      </Routes>
    </BrowserRouter>
  );
}