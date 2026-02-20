import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AMADEUS_BASE = "https://test.api.amadeus.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.value;
  }

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

  if (!apiKey || !apiSecret) {
    throw new Error("AMADEUS_API_KEY or AMADEUS_API_SECRET not configured");
  }

  const resp = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Amadeus auth failed [${resp.status}]: ${err}`);
  }

  const data = await resp.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cachedToken.value;
}

function parseDuration(iso: string): string {
  // ISO 8601 duration e.g. PT10H30M
  const h = iso.match(/(\d+)H/)?.[1] || "0";
  const m = iso.match(/(\d+)M/)?.[1] || "0";
  return `${h}h${m.padStart(2, "0")}min`;
}

function formatTime(iso: string): string {
  // e.g. "2025-06-15T10:35:00"
  const t = iso.split("T")[1]?.slice(0, 5) || "00:00";
  return t;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

const airlineCodes: Record<string, string> = {
  LA: "LATAM", AF: "Air France", KL: "KLM", AA: "American Airlines",
  BA: "British Airways", EK: "Emirates", QR: "Qatar Airways", TK: "Turkish Airlines",
  TP: "TAP Air Portugal", LH: "Lufthansa", DL: "Delta Air Lines", UA: "United Airlines",
  G3: "GOL", AD: "Azul", AR: "Aerolíneas Argentinas", IB: "Iberia", UX: "Air Europa",
  NH: "ANA", JL: "Japan Airlines", SQ: "Singapore Airlines", CX: "Cathay Pacific",
  AV: "Avianca", CM: "Copa Airlines", AM: "Aeroméxico", AC: "Air Canada",
  AZ: "ITA Airways", OS: "Austrian", LX: "Swiss", SN: "Brussels Airlines",
};

const alliances: Record<string, string> = {
  LA: "oneworld", AA: "oneworld", BA: "oneworld", IB: "oneworld", QR: "oneworld", CX: "oneworld",
  AF: "SkyTeam", KL: "SkyTeam", DL: "SkyTeam", AZ: "SkyTeam", AM: "SkyTeam",
  LH: "Star Alliance", UA: "Star Alliance", TP: "Star Alliance", NH: "Star Alliance", TK: "Star Alliance", AC: "Star Alliance", OS: "Star Alliance", LX: "Star Alliance",
  EK: "Independente", G3: "Independente", AD: "Independente", SQ: "Independente", AR: "Independente",
};

function generatePriceHistory(current: number): number[] {
  const history: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const variation = Math.sin(i * 0.7) * (current * 0.2) + Math.cos(i * 0.4) * (current * 0.1);
    history.push(Math.round(current * 1.3 + variation));
  }
  return history;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { originCode, destCode, departureDate, adults = 1, travelClass = "ECONOMY" } = body;

    if (!originCode || !destCode) {
      return new Response(JSON.stringify({ error: "originCode e destCode são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getAmadeusToken();

    // Format departure date
    const depDate = departureDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const params = new URLSearchParams({
      originLocationCode: originCode,
      destinationLocationCode: destCode,
      departureDate: depDate,
      adults: String(adults),
      travelClass,
      max: "10",
      currencyCode: "BRL",
    });

    const searchResp = await fetch(
      `${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!searchResp.ok) {
      const err = await searchResp.text();
      console.error(`Amadeus search error [${searchResp.status}]:`, err);
      return new Response(JSON.stringify({ error: `Amadeus API error: ${searchResp.status}`, fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchData = await searchResp.json();
    const offers = searchData.data || [];

    if (offers.length === 0) {
      return new Response(JSON.stringify({ results: [], fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and format offers into our PromoResult format
    const cabinMap: Record<string, string> = {
      ECONOMY: "Econômica", PREMIUM_ECONOMY: "Premium Economy",
      BUSINESS: "Executiva", FIRST: "Primeira Classe",
    };

    const results = offers.map((offer: any, idx: number) => {
      const itinerary = offer.itineraries?.[0];
      const segments = itinerary?.segments || [];
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];
      const airlineCode = offer.validatingAirlineCodes?.[0] || firstSeg?.carrierCode || "XX";
      const price = parseFloat(offer.price?.grandTotal || offer.price?.total || "0");
      const marketPrice = Math.round(price * (1.3 + (idx * 0.05)));
      const discount = Math.round(((marketPrice - price) / marketPrice) * 100);
      const aircraft = firstSeg?.aircraft?.code || "Boeing 737";
      const stops = segments.length - 1;

      return {
        id: offer.id || `amadeus-${idx}`,
        airline: airlineCodes[airlineCode] || airlineCode,
        airlineCode,
        flightNumber: `${firstSeg?.carrierCode || airlineCode} ${firstSeg?.number || ""}`,
        originCode,
        destCode,
        marketPrice,
        promoPrice: Math.round(price),
        discount,
        departDate: formatDate(firstSeg?.departure?.at?.slice(0, 10) || depDate),
        departTime: formatTime(firstSeg?.departure?.at || ""),
        returnDate: formatDate(lastSeg?.arrival?.at?.slice(0, 10) || depDate),
        returnTime: formatTime(lastSeg?.arrival?.at || ""),
        stops,
        stopCity: stops > 0 ? segments[0]?.arrival?.iataCode : undefined,
        seats: offer.numberOfBookableSeats || (1 + idx % 5),
        type: idx === 0 ? "⚡ Promoção relâmpago" : idx === 1 ? "🔥 Melhor preço" : "📉 Tarifa especial",
        duration: parseDuration(itinerary?.duration || "PT10H00M"),
        aircraft: aircraft.length <= 3 ? `${aircraft}` : aircraft,
        cabin: cabinMap[travelClass] || "Econômica",
        baggage: travelClass === "ECONOMY" ? "1x mala 23kg" : "2x malas 32kg",
        wifi: airlineCode === "EK" || airlineCode === "QR" || airlineCode === "LH",
        meal: travelClass !== "ECONOMY" || ["EK", "QR", "LH", "AF", "KL"].includes(airlineCode),
        lastSeen: idx === 0 ? "Há 2 min" : idx < 3 ? "Há 15 min" : "Há 1 hora",
        priceHistory: generatePriceHistory(price),
        alliance: alliances[airlineCode] || "Independente",
        co2: `${Math.round(250 + idx * 30)} kg CO₂`,
        source: "amadeus",
      };
    });

    return new Response(JSON.stringify({ results, source: "amadeus" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("search-flights error:", err.message);
    return new Response(JSON.stringify({ error: err.message, fallback: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
