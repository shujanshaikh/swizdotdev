import {
  FREE_PLAN_MESSAGE_COUNT,
  PREMIUM_PLAN_MESSAGE_COUNT,
} from "~/utils/constant";
import { polarClient } from "./polar";
import { getMessageCountByUserId } from "~/server/db/queries";

export const checkPremiumUser = async (userId: string, entity: "messages") => {
  const customer = await polarClient.customers.getStateExternal({
    externalId: userId,
  });

  const usedCount = (await getMessageCountByUserId(userId, 1)) ?? 0;

  const isPremium = (customer.activeSubscriptions?.length ?? 0) > 0;

  const planLimit = isPremium
    ? PREMIUM_PLAN_MESSAGE_COUNT
    : FREE_PLAN_MESSAGE_COUNT;

  const remaining = Math.max(0, planLimit - usedCount);

  const shouldThrowMessageError = entity === "messages" && remaining <= 0;

  return {
    isPremium,
    isFreePlan: !isPremium,
    shouldThrowMessageError,
  };
};
