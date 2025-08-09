import { use } from "react";
import ProjectViewPage from "~/components/projectviewpage";

export default function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  console.log(id, "id from project page")
  return <ProjectViewPage id={id} />;
}