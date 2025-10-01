import "server-only";
import { Sandbox } from "@e2b/code-interpreter";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId, {
    requestTimeoutMs: 900_000,
    //autoPause: true,
    timeoutMs: 900_000,
  });
  return sandbox;
}





