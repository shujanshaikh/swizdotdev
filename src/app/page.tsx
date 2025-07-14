import Link from "next/link";
import { getProject } from "~/server/db/queries";

export default async function ChatPage() {
  const project = await getProject();


  return (
    <div className="mx-auto max-w-md py-24">


      <ul>
        {project.map((p) => (
          <li key={p.id}>
            <Link
              href={`/project/${p.id}`}
              className="text-blue-600 hover:underline"
            >
              {p.title} - {p.id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
