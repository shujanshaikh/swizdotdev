import Chat from "~/components/Chat";

export default function ChatPage() {
  return <Chat id={crypto.randomUUID()} initialMessages={[]} />;
}
