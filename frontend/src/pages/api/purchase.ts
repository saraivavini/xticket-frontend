import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === "POST") {
    const { type, cost } = request.body;

    const stripePrice = await stripe.prices.create({
      currency: "brl",
      unit_amount: Number(cost * 100),
      product:
        type === "AIRFARE" ? "prod_JF6K3MwSOuM2gb" : "prod_JF6KYdH9b0Vfk7",
    });

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.WEB_URL}/checkout-success`,
      cancel_url: `${process.env.WEB_URL}`,
    });

    return response.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    response.setHeader("Allow", "POST");
    response.status(405).end("Method not allowed");
  }
};
