import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProjectViewPage from "~/components/projectviewpage";
import { auth } from "~/lib/auth";

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) {
        redirect("/login");
      }
  const { id } = await props.params;
  return <ProjectViewPage id={id} />;
}