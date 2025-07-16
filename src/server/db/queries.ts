import type { UIMessage } from "ai";
import { db } from "../db/index";
import { message, project, type DBMessage } from "./schema";
import { asc, desc, eq } from "drizzle-orm";

export const createProject = async ({ title }: { title: string }) => {
  const result = await db.insert(project).values({ title }).returning();

  return result[0]?.id;
};

export const getProjects = async () => {
  try {
    const projects = await db.select().from(project).orderBy(desc(project.updatedAt));
    return projects;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw new Error("Failed to fetch projects");
  }
};


export const loadProject = async (projectId: string) => {
  const messagesResult = await db
    .select()
    .from(message)
    .where(eq(message.projectId, projectId))
    .orderBy(message.createdAt);

  return messagesResult as unknown as UIMessage[];
  //   return messagesResult.map((msg) => ({
  //     id: msg.id,
  //     role: msg.role as "user" | "assistant",
  //     content: msg.parts,
  //   })) as UIMessage[];
};

export async function getProjectById({ id }: { id: string }) {
  try {
    const [selectedProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));
    return selectedProject;
  } catch (error) {
    throw new Error("Failed to get project by id" + error);
  }
}

export async function  saveProject({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  try {
    return await db.insert(project).values({
      id,
      createdAt: new Date(),
      title,
    });
  } catch (error) {
    console.log(error);
  }
};

export async function saveMessages({ messages }: { messages: Array<DBMessage> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new Error("Failed to save messages" + error);
  }
}

export async function getMessagesByProjectId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.projectId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new Error("Failed to get messages by project id" + error);
  }
}
