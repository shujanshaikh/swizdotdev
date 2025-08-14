import "server-only";
import type { UIMessage } from "ai";
import { db } from "../db/index";
import { message, project, type DBMessage } from "./schema";
import { asc, desc, eq } from "drizzle-orm";

export const createProject = async ({ title, userId }: { title: string; userId: string }) => {
  const result = await db.insert(project).values({ title, userId }).returning();

  return result[0]?.id;
};

export const getProjects = async ({ userId }: { userId: string }) => {
  try {
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(desc(project.updatedAt));
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
  sandboxId,
  sandboxUrl,
  userId,
}: {
  id: string;
  title: string;
  sandboxId: string;
  sandboxUrl: string;
  userId: string;
}) {
  try {
    return await db.insert(project).values({
      id,
      createdAt: new Date(),
      title,
      sandboxId,
      sandboxUrl,
      userId,
    });
  } catch (error) {
    console.log(error);
  }
};

export async function saveMessages({ 
  messages, 
}: { 
  messages: Array<DBMessage>, 
}) {
  try {
    const savedMessages = await db
      .insert(message)
      .values(messages)
      .returning();
    console.log(
      `Inserted ${savedMessages.length} message(s)`,
      savedMessages.map((m) => m.id),
      "savedMessages",
    );
    return savedMessages;
  } catch (error) {
    throw new Error("Failed to save messages: " + error);
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


export const getSanboxId = async (projectId: string) => {
  const result = await db
    .select({ sandboxId: project.sandboxId })
    .from(project)
    .where(eq(project.id, projectId))
    .orderBy(desc(project.updatedAt))
    .limit(1);

  return result[0]?.sandboxId || null;
};

