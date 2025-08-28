import "server-only";
import { Sandbox } from "@e2b/code-interpreter";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId, {
    requestTimeoutMs: 900_000,
    autoPause: true,
    timeoutMs: 900_000,
  });
  return sandbox;
}

// // In-memory timers to auto-pause sandboxes after inactivity
// const sandboxAutoPauseTimers = new Map<string, NodeJS.Timeout>();

// function getAutoPauseDelayMs(): number {
//   const minutesFromEnv = process.env.SANDBOX_AUTO_PAUSE_MINUTES;
//   const minutes = minutesFromEnv ? Number(minutesFromEnv) : 30;
//   const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 30;
//   return safeMinutes * 60 * 1000;
// }

// export function cancelSandboxAutoPause(sandboxId: string) {
//   const existingTimer = sandboxAutoPauseTimers.get(sandboxId);
//   if (existingTimer) {
//     clearTimeout(existingTimer);
//     sandboxAutoPauseTimers.delete(sandboxId);
//   }
// }

// export function touchSandboxActivity(sandboxId: string) {
//   // Reset existing timer if present
//   cancelSandboxAutoPause(sandboxId);

//   const delayMs = getAutoPauseDelayMs();
//   const timer = setTimeout(async () => {
//     try {
//       const sandbox = await getSandbox(sandboxId);
//       await sandbox.pause();
//       console.log(
//         `Sandbox ${sandbox.sandboxId} auto-paused after ${Math.round(
//           delayMs / 60000,
//         )} minutes`,
//       );
//     } catch (error) {
//       console.error("Failed to auto-pause sandbox:", error);
//     } finally {
//       sandboxAutoPauseTimers.delete(sandboxId);
//     }
//   }, delayMs);

//   sandboxAutoPauseTimers.set(sandboxId, timer);
// }



