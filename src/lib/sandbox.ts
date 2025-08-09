import "server-only";
import { Sandbox } from "@e2b/code-interpreter";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId, {
    requestTimeoutMs: 300000,
  });
  return sandbox;
}


