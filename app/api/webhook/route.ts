import Stripe from "stripe";
import {headers} from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

// here we are catching the request made at stripe which will be either for checkout or billing(canccellation)
export async function POST(req: Request){

    const body=await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try{
        event=stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    }
    catch(error: any){
        return new NextResponse(`Webhook Error: ${error.message}`,{status:400});
    }

    // now we have retrieved the particular event which was created by stripe(billing or checkout)

    const session=event.data.object as Stripe.Checkout.Session;

    // checking type of event
    if(event.type === "checkout.session.completed"){
      
      // retrieving subscription id through the event retrieved above
      const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // no user to link the subscription
        if(!session?.metadata?.userid){
            return new NextResponse("User id is required",{status:400});
        }

        // update database for the subscribed user
        await prismadb.userSubscription.create({
            data:{
                userId:session?.metadata?.userId,//we can't use clerk here because this webhook is running independently from our application
                // also we need to add this webhook to public routes because this is going to be accessed by stripe in a different way
                stripeSubscriptionId:subscription.id,
                stripeCustomerId:subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end*1000
                ),
            },
        });
    }
    
    // event for when user upgraded their subscription
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
    
        await prismadb.userSubscription.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            // subscription is updated so are these values below
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        })
      }
    
      return new NextResponse(null, { status: 200 })
    };

