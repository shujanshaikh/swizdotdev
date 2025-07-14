import Chat from "~/components/Chat";

export default function ProjectPage() {
    const id = crypto.randomUUID();
  return (
    <Chat id={id} initialMessages={[]} />
  )
}