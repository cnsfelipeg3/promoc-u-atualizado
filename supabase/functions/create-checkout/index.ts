import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MARKUP = 1.1; // 10% markup sobre o preço da Amadeus

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      outbound,
      returnFlight,
      passengers = 1,
      origin,
      destination,
    } = body;

    if (!outbound) {
      return new Response(
        JSON.stringify({ error: "Voo de ida é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não configurado");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Calcular preço final com markup de 10%
    const outboundTotal = Math.round(outbound.promoPrice * MARKUP);
    const returnTotal = returnFlight ? Math.round(returnFlight.promoPrice * MARKUP) : 0;
    const grandTotal = outboundTotal + returnTotal;

    // Montar descrição legível
    const outboundDesc = `${outbound.airline} ${origin} → ${destination} · ${outbound.departDate} ${outbound.departTime} · ${outbound.duration} · ${outbound.stops === 0 ? "Direto" : `${outbound.stops} escala`} · ${passengers} pax`;
    const returnDesc = returnFlight
      ? `${returnFlight.airline} ${destination} → ${origin} · ${returnFlight.departDate} ${returnFlight.departTime} · ${returnFlight.duration} · ${returnFlight.stops === 0 ? "Direto" : `${returnFlight.stops} escala`}`
      : null;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `✈️ Voo de Ida — ${origin} → ${destination}`,
            description: outboundDesc,
            metadata: {
              airline: outbound.airline,
              flight: outbound.flightNumber,
              departure: outbound.departTime,
              stops: String(outbound.stops),
            },
          },
          unit_amount: outboundTotal * 100, // Stripe usa centavos
        },
        quantity: 1,
      },
    ];

    if (returnFlight && returnDesc) {
      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: `✈️ Voo de Volta — ${destination} → ${origin}`,
            description: returnDesc,
            metadata: {
              airline: returnFlight.airline,
              flight: returnFlight.flightNumber,
              departure: returnFlight.departTime,
              stops: String(returnFlight.stops),
            },
          },
          unit_amount: returnTotal * 100,
        },
        quantity: 1,
      });
    }

    const origin_url = req.headers.get("origin") || "https://air-insight-alerts.lovable.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin_url}?payment=success`,
      cancel_url: `${origin_url}?payment=cancelled`,
      locale: "pt-BR",
      metadata: {
        outbound_id: outbound.id,
        return_id: returnFlight?.id || "",
        passengers: String(passengers),
        grand_total_brl: String(grandTotal),
      },
      custom_text: {
        submit: {
          message: `Total: R$ ${grandTotal.toLocaleString("pt-BR")} (inclui todas as taxas e serviços PromoCéu)`,
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id, grandTotal }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("create-checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
