import { convertToUIMessages } from "~/lib/utils";
import ProjectView from "./project-view";
import { getMessagesByProjectId } from "~/server/db/queries";




export default  async function ProjectViewPage({
   id 
}: {
    id: string | undefined;
}) {
    const dbMessages = await getMessagesByProjectId({ id: id! })
    const uimessages =  convertToUIMessages(dbMessages!);
    console.log(uimessages, "uimessages from project view page")
    return (
        <ProjectView initialMessages={uimessages} id={id!} isLoading={false} />
    )
}