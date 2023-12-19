import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const DAY_IN_MS = 86_400_000;

export const checkSubscription=async()=>{
    const {userId} = auth();
    if(!userId){
        return false;
    }
    
    const userSubscription=await prismadb.userSubscription.findUnique({
        where:{
            userId,
        },
        select:{
            stripeCurrentPeriodEnd:true,
            stripeSubscriptionId:true,
            stripePriceId:true,
            stripeCustomerId:true,
        },
    });

    if(!userSubscription)
    return false;

// check whether he is subscribed and not expired(1 day grace period)
    const isValid=
    userSubscription.stripePriceId&&
    userSubscription.stripeCurrentPeriodEnd?.getTime()!+DAY_IN_MS > Date.now();
    
    return !!isValid;
}