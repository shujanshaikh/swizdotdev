import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "~/env";

const upstashUrl = env.UPSTASH_REDIS_REST_URL;
const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;
const isRateLimitingEnabled =
  upstashUrl &&
  upstashToken &&
  upstashUrl.trim() !== "" &&
  upstashToken.trim() !== "";

let generationRateLimit: Ratelimit | null;
let redis: Redis | null;

if (isRateLimitingEnabled) {
  redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });

  generationRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "2419200 s"),
    analytics: true,
    prefix: "swiz_rate_limit",
  });
}


// Fucntion to get User identity
export function getUserIdentifier(request: Request) {
  const forwaded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwaded?.split(",")[0] || realIp || cfConnectingIp || "unknown";

  return `ip${ip}`;
}

// Function to get just the IP address from request
export function getUserIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";
}


// Get the user associated with that project id 
export async function associatedWithProjectId(
  projectId: string,
  userIP: string,
): Promise<void> {
  if (!redis) return;

  try {
    //Storing all the project in redis for ip check

    await redis.sadd(`user_projects${userIP}`, projectId);
  } catch (error) {
    console.warn(error);
  }
}


// Get the user projects from the redis 
export async function getUserProjects(userIP: string): Promise<string[]> {
  if (!redis) return [];

  try {
    const projectId = await redis.smembers(`user_projects:${userIP}`);

    return projectId as string[];
  } catch (error) {
    console.warn("Failed to get user projects:", error);
    return [];
  }
}


// Get the rate limit of the specific user
export async function checkRateLimit(identifier: string) {
  if (!isRateLimitingEnabled || !generationRateLimit) {
    return {
      success: true,
      limit: 3,
      reset: Date.now() + 2419200000, // 28 days from now
      remaining: 3,
      resetTime: new Date(Date.now() + 2419200000),
    };
  }

  try {
    const { limit, success, reset, remaining } =
      await generationRateLimit.limit(identifier);

    return {
      success,
      limit,
      reset,
      remaining,
      resetTime: new Date(reset),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: 3,
      reset: Date.now() + 2419200000, // 28 days from now
      remaining: 3,
      resetTime: new Date(Date.now() + 2419200000),
    }
  }
}
