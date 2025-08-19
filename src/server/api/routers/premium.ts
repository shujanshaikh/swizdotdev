import { polarClient } from "~/lib/polar";
import { protectedProcedure } from "../trpc";
import { getMessageCountByUserId } from "~/server/db/queries";
import { FREE_PLAN_MESSAGE_COUNT, PREMIUM_PLAN_MESSAGE_COUNT } from "~/utils/constant";

export const premiumRouter = {
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.session.user.id,
    });

    const usedCount = (await getMessageCountByUserId(ctx.session.user.id, 1)) ?? 0;
    const isPremium = (customer.activeSubscriptions?.length ?? 0) > 0;
    const planLimit = isPremium ? PREMIUM_PLAN_MESSAGE_COUNT : FREE_PLAN_MESSAGE_COUNT;
    const remaining = Math.max(0, planLimit - usedCount);

    return {
      isPremium,
      planLimit,
      usedCount,
      remaining,
    };
  }),



  getProducts : protectedProcedure.query(async ({}) => {
    const products = await polarClient.products.list({
        isArchived : false,
        isRecurring : true,
        sorting  : ["-price_amount"]
    });
    return products.result.items;
  }),
 

  getCurrentSubscription : protectedProcedure.query(async ({ctx}) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.session.user.id,
    });

    const subscription = customer.activeSubscriptions[0];
    if(!subscription){
        return null;
    }

    const product = await polarClient.products.get({id : subscription.productId});

    return product
  }),
};
