import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-05-27.dahlia" as any,
});

export async function POST(req: NextRequest) {
  try {
    if (!stripeSecretKey) {
      console.error("Stripe Secret Key is missing.");
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "WiBC Supporter Subscription",
              description: "Includes diagnostic report with actionable path to gender equity.",
            },
            unit_amount: 15000, // £150.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      customer_email: body.email || undefined,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err: any) {
    console.error("[Stripe API] Error creating checkout session:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
