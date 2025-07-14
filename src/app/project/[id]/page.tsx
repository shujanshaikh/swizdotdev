import Chat from "~/components/Chat";
import { loadProject } from "~/server/db/queries";


export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params; 
  console.log((await props.params).id)
  const messages = await loadProject(id); 
  return <Chat id={id} initialMessages={messages} />; 
}