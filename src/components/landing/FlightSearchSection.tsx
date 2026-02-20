import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Search, Plane, Calendar, MapPin, TrendingDown, ArrowRight, ArrowLeftRight,
  Sparkles, X, Clock, AlertTriangle, ChevronDown, Users, Briefcase, Filter,
  ArrowUpDown, Bell, Heart, Share2, BarChart3, Luggage, Wifi, UtensilsCrossed,
  Zap, Eye, Star, Shield, ChevronRight, RefreshCw
} from "lucide-react";

// ─── Real airline route data with IATA codes ───
const realRoutes: Record<string, { airlines: string[]; baseTime: string; aircraft: string }> = {
  "GRU-CDG": { airlines: ["LATAM LA", "Air France AF", "KLM KL"], baseTime: "11h40", aircraft: "Boeing 777-300ER" },
  "GRU-LHR": { airlines: ["LATAM LA", "British Airways BA"], baseTime: "11h50", aircraft: "Boeing 787-9" },
  "GRU-JFK": { airlines: ["LATAM LA", "American Airlines AA", "Delta DL"], baseTime: "10h15", aircraft: "Boeing 777-200ER" },
  "GRU-MIA": { airlines: ["LATAM LA", "American Airlines AA", "GOL G3"], baseTime: "8h30", aircraft: "Boeing 767-300ER" },
  "GRU-MCO": { airlines: ["LATAM LA", "Azul AD", "GOL G3"], baseTime: "9h00", aircraft: "Airbus A330-200" },
  "GRU-LIS": { airlines: ["LATAM LA", "TAP TP", "Azul AD"], baseTime: "9h30", aircraft: "Airbus A330-900neo" },
  "GRU-FCO": { airlines: ["LATAM LA", "ITA Airways AZ", "Alitalia AZ"], baseTime: "11h20", aircraft: "Boeing 777-300ER" },
  "GRU-MAD": { airlines: ["LATAM LA", "Iberia IB", "Air Europa UX"], baseTime: "10h40", aircraft: "Airbus A350-900" },
  "GRU-FRA": { airlines: ["LATAM LA", "Lufthansa LH"], baseTime: "11h55", aircraft: "Boeing 747-8" },
  "GRU-AMS": { airlines: ["LATAM LA", "KLM KL"], baseTime: "11h30", aircraft: "Boeing 787-9" },
  "GRU-DXB": { airlines: ["Emirates EK"], baseTime: "14h30", aircraft: "Airbus A380-800" },
  "GRU-DOH": { airlines: ["Qatar Airways QR"], baseTime: "14h10", aircraft: "Boeing 777-300ER" },
  "GRU-IST": { airlines: ["Turkish Airlines TK"], baseTime: "12h50", aircraft: "Boeing 787-9" },
  "GRU-NRT": { airlines: ["LATAM LA"], baseTime: "24h30", aircraft: "Boeing 787-9" },
  "GRU-EZE": { airlines: ["LATAM LA", "GOL G3", "Aerolíneas Argentinas AR"], baseTime: "2h50", aircraft: "Airbus A320" },
  "GRU-SCL": { airlines: ["LATAM LA", "SKY H2"], baseTime: "4h10", aircraft: "Boeing 767-300ER" },
  "GRU-BOG": { airlines: ["LATAM LA", "Avianca AV"], baseTime: "6h20", aircraft: "Airbus A320" },
  "GRU-LIM": { airlines: ["LATAM LA"], baseTime: "5h10", aircraft: "Boeing 767-300ER" },
  "GRU-MEX": { airlines: ["LATAM LA", "Aeromexico AM"], baseTime: "10h00", aircraft: "Boeing 787-8" },
  "GRU-SSA": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "2h20", aircraft: "Boeing 737-800" },
  "GRU-REC": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "3h20", aircraft: "Airbus A320neo" },
  "GRU-FOR": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "3h40", aircraft: "Boeing 737 MAX 8" },
  "GRU-BSB": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "1h45", aircraft: "Airbus A320" },
  "GRU-POA": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "1h40", aircraft: "Boeing 737-800" },
  "GRU-CWB": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "1h10", aircraft: "Airbus A319" },
  "GRU-FLN": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "1h20", aircraft: "Airbus A320" },
  "GRU-MAO": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "3h55", aircraft: "Boeing 737-800" },
  "GRU-BEL": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "3h30", aircraft: "Boeing 737-800" },
  "GRU-NAT": { airlines: ["LATAM LA", "GOL G3", "Azul AD"], baseTime: "3h30", aircraft: "Boeing 737 MAX 8" },
  "GIG-LIS": { airlines: ["TAP TP"], baseTime: "9h15", aircraft: "Airbus A330-900neo" },
  "GIG-CDG": { airlines: ["Air France AF"], baseTime: "11h20", aircraft: "Boeing 777-200ER" },
  "GIG-MIA": { airlines: ["American Airlines AA"], baseTime: "8h45", aircraft: "Boeing 777-200ER" },
  "GIG-SSA": { airlines: ["LATAM LA", "GOL G3"], baseTime: "2h15", aircraft: "Boeing 737-800" },
  "CNF-LIS": { airlines: ["Azul AD"], baseTime: "9h00", aircraft: "Airbus A330-900neo" },
  "POA-EZE": { airlines: ["LATAM LA", "Aerolíneas Argentinas AR"], baseTime: "2h00", aircraft: "Airbus A320" },
  "JFK-LHR": { airlines: ["British Airways BA", "American Airlines AA", "Delta DL", "Virgin Atlantic VS"], baseTime: "7h00", aircraft: "Boeing 787-9" },
  "JFK-CDG": { airlines: ["Air France AF", "Delta DL"], baseTime: "7h30", aircraft: "Airbus A350-900" },
  "MIA-CUN": { airlines: ["American Airlines AA"], baseTime: "2h00", aircraft: "Boeing 737-800" },
  "LHR-DXB": { airlines: ["Emirates EK", "British Airways BA"], baseTime: "6h50", aircraft: "Airbus A380-800" },
  "CDG-NRT": { airlines: ["Air France AF", "ANA NH"], baseTime: "12h00", aircraft: "Boeing 777-300ER" },
};

// Major airports (keeping same list)
const airports = [
  // Brazil
  { code: "GRU", city: "São Paulo", name: "Guarulhos", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "CGH", city: "São Paulo", name: "Congonhas", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "GIG", city: "Rio de Janeiro", name: "Galeão", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "SDU", city: "Rio de Janeiro", name: "Santos Dumont", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "BSB", city: "Brasília", name: "Juscelino Kubitschek", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "CNF", city: "Belo Horizonte", name: "Confins", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "SSA", city: "Salvador", name: "Dep. Luís Eduardo Magalhães", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "REC", city: "Recife", name: "Guararapes", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "FOR", city: "Fortaleza", name: "Pinto Martins", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "POA", city: "Porto Alegre", name: "Salgado Filho", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "CWB", city: "Curitiba", name: "Afonso Pena", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "FLN", city: "Florianópolis", name: "Hercílio Luz", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "BEL", city: "Belém", name: "Val de Cans", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "MAO", city: "Manaus", name: "Eduardo Gomes", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "NAT", city: "Natal", name: "Gov. Aluízio Alves", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "MCZ", city: "Maceió", name: "Zumbi dos Palmares", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "VCP", city: "Campinas", name: "Viracopos", country: "Brasil", flag: "🇧🇷", hub: true },
  { code: "CGB", city: "Cuiabá", name: "Marechal Rondon", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "GYN", city: "Goiânia", name: "Santa Genoveva", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "VIT", city: "Vitória", name: "Eurico de Aguiar Salles", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "SLZ", city: "São Luís", name: "Marechal Cunha Machado", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "THE", city: "Teresina", name: "Senador Petrônio Portella", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "AJU", city: "Aracaju", name: "Santa Maria", country: "Brasil", flag: "🇧🇷", hub: false },
  { code: "JPA", city: "João Pessoa", name: "Presidente Castro Pinto", country: "Brasil", flag: "🇧🇷", hub: false },
  // Americas
  { code: "JFK", city: "Nova York", name: "John F. Kennedy", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "EWR", city: "Newark", name: "Liberty", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "LAX", city: "Los Angeles", name: "International", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "MIA", city: "Miami", name: "International", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "MCO", city: "Orlando", name: "International", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "ORD", city: "Chicago", name: "O'Hare", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "SFO", city: "São Francisco", name: "International", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "DFW", city: "Dallas", name: "Fort Worth", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "IAH", city: "Houston", name: "George Bush", country: "EUA", flag: "🇺🇸", hub: true },
  { code: "BOS", city: "Boston", name: "Logan", country: "EUA", flag: "🇺🇸", hub: false },
  { code: "LAS", city: "Las Vegas", name: "Harry Reid", country: "EUA", flag: "🇺🇸", hub: false },
  { code: "SEA", city: "Seattle", name: "Tacoma", country: "EUA", flag: "🇺🇸", hub: false },
  { code: "YYZ", city: "Toronto", name: "Pearson", country: "Canadá", flag: "🇨🇦", hub: true },
  { code: "YUL", city: "Montreal", name: "Trudeau", country: "Canadá", flag: "🇨🇦", hub: false },
  { code: "MEX", city: "Cidade do México", name: "Benito Juárez", country: "México", flag: "🇲🇽", hub: true },
  { code: "CUN", city: "Cancún", name: "International", country: "México", flag: "🇲🇽", hub: false },
  { code: "EZE", city: "Buenos Aires", name: "Ezeiza", country: "Argentina", flag: "🇦🇷", hub: true },
  { code: "SCL", city: "Santiago", name: "Arturo Merino Benítez", country: "Chile", flag: "🇨🇱", hub: true },
  { code: "BOG", city: "Bogotá", name: "El Dorado", country: "Colômbia", flag: "🇨🇴", hub: true },
  { code: "LIM", city: "Lima", name: "Jorge Chávez", country: "Peru", flag: "🇵🇪", hub: true },
  { code: "PTY", city: "Cidade do Panamá", name: "Tocumen", country: "Panamá", flag: "🇵🇦", hub: true },
  { code: "MVD", city: "Montevidéu", name: "Carrasco", country: "Uruguai", flag: "🇺🇾", hub: false },
  { code: "ASU", city: "Assunção", name: "Silvio Pettirossi", country: "Paraguai", flag: "🇵🇾", hub: false },
  // Europe
  { code: "LIS", city: "Lisboa", name: "Humberto Delgado", country: "Portugal", flag: "🇵🇹", hub: true },
  { code: "OPO", city: "Porto", name: "Francisco Sá Carneiro", country: "Portugal", flag: "🇵🇹", hub: false },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "França", flag: "🇫🇷", hub: true },
  { code: "ORY", city: "Paris", name: "Orly", country: "França", flag: "🇫🇷", hub: false },
  { code: "LHR", city: "Londres", name: "Heathrow", country: "Reino Unido", flag: "🇬🇧", hub: true },
  { code: "LGW", city: "Londres", name: "Gatwick", country: "Reino Unido", flag: "🇬🇧", hub: false },
  { code: "MAD", city: "Madri", name: "Barajas", country: "Espanha", flag: "🇪🇸", hub: true },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "Espanha", flag: "🇪🇸", hub: true },
  { code: "FCO", city: "Roma", name: "Fiumicino", country: "Itália", flag: "🇮🇹", hub: true },
  { code: "MXP", city: "Milão", name: "Malpensa", country: "Itália", flag: "🇮🇹", hub: true },
  { code: "FRA", city: "Frankfurt", name: "International", country: "Alemanha", flag: "🇩🇪", hub: true },
  { code: "MUC", city: "Munique", name: "Franz Josef Strauss", country: "Alemanha", flag: "🇩🇪", hub: true },
  { code: "AMS", city: "Amsterdã", name: "Schiphol", country: "Holanda", flag: "🇳🇱", hub: true },
  { code: "ZRH", city: "Zurique", name: "Airport", country: "Suíça", flag: "🇨🇭", hub: true },
  { code: "IST", city: "Istambul", name: "Airport", country: "Turquia", flag: "🇹🇷", hub: true },
  { code: "ATH", city: "Atenas", name: "Eleftherios Venizelos", country: "Grécia", flag: "🇬🇷", hub: false },
  { code: "PRG", city: "Praga", name: "Václav Havel", country: "Tchéquia", flag: "🇨🇿", hub: false },
  { code: "VIE", city: "Viena", name: "Schwechat", country: "Áustria", flag: "🇦🇹", hub: true },
  { code: "CPH", city: "Copenhague", name: "Kastrup", country: "Dinamarca", flag: "🇩🇰", hub: false },
  { code: "DUB", city: "Dublin", name: "Airport", country: "Irlanda", flag: "🇮🇪", hub: false },
  { code: "HEL", city: "Helsinque", name: "Vantaa", country: "Finlândia", flag: "🇫🇮", hub: false },
  { code: "OSL", city: "Oslo", name: "Gardermoen", country: "Noruega", flag: "🇳🇴", hub: false },
  { code: "ARN", city: "Estocolmo", name: "Arlanda", country: "Suécia", flag: "🇸🇪", hub: false },
  { code: "WAW", city: "Varsóvia", name: "Chopin", country: "Polônia", flag: "🇵🇱", hub: false },
  { code: "BUD", city: "Budapeste", name: "Ferenc Liszt", country: "Hungria", flag: "🇭🇺", hub: false },
  // Middle East & Africa
  { code: "DXB", city: "Dubai", name: "International", country: "Emirados Árabes", flag: "🇦🇪", hub: true },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed", country: "Emirados Árabes", flag: "🇦🇪", hub: true },
  { code: "DOH", city: "Doha", name: "Hamad", country: "Catar", flag: "🇶🇦", hub: true },
  { code: "JNB", city: "Joanesburgo", name: "O.R. Tambo", country: "África do Sul", flag: "🇿🇦", hub: true },
  { code: "CPT", city: "Cidade do Cabo", name: "International", country: "África do Sul", flag: "🇿🇦", hub: false },
  { code: "CAI", city: "Cairo", name: "International", country: "Egito", flag: "🇪🇬", hub: true },
  { code: "ADD", city: "Adis Abeba", name: "Bole", country: "Etiópia", flag: "🇪🇹", hub: true },
  { code: "CMN", city: "Casablanca", name: "Mohammed V", country: "Marrocos", flag: "🇲🇦", hub: false },
  // Asia & Oceania
  { code: "NRT", city: "Tóquio", name: "Narita", country: "Japão", flag: "🇯🇵", hub: true },
  { code: "HND", city: "Tóquio", name: "Haneda", country: "Japão", flag: "🇯🇵", hub: true },
  { code: "KIX", city: "Osaka", name: "Kansai", country: "Japão", flag: "🇯🇵", hub: false },
  { code: "ICN", city: "Seul", name: "Incheon", country: "Coreia do Sul", flag: "🇰🇷", hub: true },
  { code: "PEK", city: "Pequim", name: "Capital", country: "China", flag: "🇨🇳", hub: true },
  { code: "PVG", city: "Xangai", name: "Pudong", country: "China", flag: "🇨🇳", hub: true },
  { code: "HKG", city: "Hong Kong", name: "International", country: "China", flag: "🇭🇰", hub: true },
  { code: "SIN", city: "Singapura", name: "Changi", country: "Singapura", flag: "🇸🇬", hub: true },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Tailândia", flag: "🇹🇭", hub: true },
  { code: "DEL", city: "Nova Delhi", name: "Indira Gandhi", country: "Índia", flag: "🇮🇳", hub: true },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji", country: "Índia", flag: "🇮🇳", hub: true },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Austrália", flag: "🇦🇺", hub: true },
  { code: "MEL", city: "Melbourne", name: "Tullamarine", country: "Austrália", flag: "🇦🇺", hub: false },
  { code: "AKL", city: "Auckland", name: "International", country: "Nova Zelândia", flag: "🇳🇿", hub: false },
  { code: "MLE", city: "Malé", name: "Velana", country: "Maldivas", flag: "🇲🇻", hub: false },
  { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malásia", flag: "🇲🇾", hub: true },
  { code: "MNL", city: "Manila", name: "Ninoy Aquino", country: "Filipinas", flag: "🇵🇭", hub: false },
];

interface PromoResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  destCode: string;
  marketPrice: number;
  promoPrice: number;
  discount: number;
  departDate: string;
  departTime: string;
  returnDate: string;
  returnTime: string;
  stops: number;
  stopCity?: string;
  seats: number;
  type: string;
  duration: string;
  aircraft: string;
  cabin: string;
  baggage: string;
  wifi: boolean;
  meal: boolean;
  lastSeen: string;
  priceHistory: number[];
  alliance: string;
  co2: string;
}

type SortOption = "price" | "duration" | "discount" | "departure";
type CabinClass = "economy" | "premium" | "business" | "first";

function generatePromos(
  originCode: string, destCode: string, dateStr: string,
  passengers: number, cabinClass: CabinClass
): PromoResult[] {
  const routeKey = `${originCode}-${destCode}`;
  const reverseKey = `${destCode}-${originCode}`;
  const routeData = realRoutes[routeKey] || realRoutes[reverseKey];
  
  const baseDate = dateStr ? new Date(dateStr) : new Date(Date.now() + 30 * 86400000);
  const hash = (originCode + destCode).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const isDomestic = airports.find(a => a.code === originCode)?.country === "Brasil" && airports.find(a => a.code === destCode)?.country === "Brasil";
  
  const classMultiplier = { economy: 1, premium: 1.6, business: 3.2, first: 5.5 }[cabinClass];
  const baseMarket = (isDomestic ? 800 + (hash % 1200) : 2800 + (hash % 6000)) * classMultiplier;

  // Use real airlines if route exists, otherwise generate
  const routeAirlines = routeData?.airlines || [
    "LATAM LA", "GOL G3", "Azul AD", "TAP TP", "Emirates EK",
    "Air France AF", "KLM KL", "Lufthansa LH", "American Airlines AA", "United UA"
  ].slice(0, 4 + (hash % 4));

  const stopCities = isDomestic
    ? ["BSB", "CNF", "GIG"]
    : ["LIS", "MAD", "CDG", "FRA", "AMS", "IST", "DXB", "DOH", "PTY", "BOG"];

  const alliances: Record<string, string> = {
    "LA": "oneworld", "AA": "oneworld", "BA": "oneworld", "IB": "oneworld", "QR": "oneworld",
    "AF": "SkyTeam", "KL": "SkyTeam", "DL": "SkyTeam", "AZ": "SkyTeam", "AM": "SkyTeam",
    "LH": "Star Alliance", "UA": "Star Alliance", "TP": "Star Alliance", "NH": "Star Alliance", "TK": "Star Alliance",
    "EK": "Independente", "G3": "Independente", "AD": "Independente", "AR": "Independente",
  };

  const results: PromoResult[] = [];
  const numResults = 6 + (hash % 5);

  for (let i = 0; i < numResults; i++) {
    const airlineStr = routeAirlines[i % routeAirlines.length];
    const [airlineName, airlineCode] = airlineStr.includes(" ") ? [airlineStr.split(" ").slice(0, -1).join(" "), airlineStr.split(" ").pop()!] : [airlineStr, "XX"];
    
    const discountPct = 20 + ((hash + i * 7) % 55);
    const market = Math.round(baseMarket + (i * 180 - 350) + Math.sin(i * 2.3) * 300);
    const promo = Math.round(market * (1 - discountPct / 100) * passengers);
    const daysOffset = Math.floor(i * 1.5 - 1);
    const depart = new Date(baseDate.getTime() + daysOffset * 86400000);
    const returnD = new Date(depart.getTime() + (5 + (hash + i) % 12) * 86400000);
    
    const stops = isDomestic ? (i % 3 === 0 ? 0 : 1) : (i % 5 === 0 ? 0 : i % 4 === 0 ? 2 : 1);
    const baseHours = routeData ? parseInt(routeData.baseTime) : (isDomestic ? 2 + (hash + i) % 3 : 8 + (hash + i) % 14);
    const extraMinutes = stops * (40 + (hash + i) % 60);
    const totalMinutes = baseHours * 60 + extraMinutes + ((hash + i * 5) % 40);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const departHour = 5 + ((hash + i * 3) % 18);
    const departMin = ((hash + i * 17) % 4) * 15;
    const arrivalMinutes = departHour * 60 + departMin + totalMinutes;
    const arrHour = Math.floor(arrivalMinutes / 60) % 24;
    const arrMin = arrivalMinutes % 60;

    const types = ["⚡ Promoção relâmpago", "🔥 Erro tarifário", "📉 Tarifa especial", "🌸 Oferta sazonal", "⏰ Último minuto", "🎯 Tarifa negociada", "✈️ Rota inaugural"];
    const lastSeenOptions = ["Há 3 min", "Há 12 min", "Há 28 min", "Há 1 hora", "Há 2 horas"];

    // Generate price history (last 30 days)
    const priceHistory: number[] = [];
    for (let d = 0; d < 30; d++) {
      const variation = Math.sin(d * 0.5 + hash) * 400 + Math.cos(d * 0.3 + i) * 200;
      priceHistory.push(Math.round(Math.max(market, promo + 200) + variation));
    }
    priceHistory.push(Math.max(promo, 199) * (passengers > 1 ? 1 : 1)); // current promo price

    const baggage = isDomestic
      ? (cabinClass === "economy" ? "1x mala 23kg" : "2x malas 32kg")
      : (cabinClass === "economy" ? "2x malas 23kg" : cabinClass === "business" ? "2x malas 32kg + 1 mão" : "3x malas 32kg");

    const co2Base = isDomestic ? 80 + (hash + i) % 60 : 400 + (hash + i) % 300;

    results.push({
      id: `${originCode}-${destCode}-${i}`,
      airline: airlineName,
      airlineCode,
      flightNumber: `${airlineCode} ${1000 + (hash + i * 37) % 9000}`,
      originCode, destCode,
      marketPrice: Math.max(market, promo + 300) * (passengers > 1 ? passengers : 1),
      promoPrice: Math.max(promo, passengers * 149),
      discount: discountPct,
      departDate: depart.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
      departTime: `${String(departHour).padStart(2, "0")}:${String(departMin).padStart(2, "0")}`,
      returnDate: returnD.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
      returnTime: `${String(arrHour).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}`,
      stops,
      stopCity: stops > 0 ? airports.find(a => a.code === stopCities[(hash + i) % stopCities.length])?.city : undefined,
      seats: 1 + ((hash + i) % 7),
      type: types[(hash + i) % types.length],
      duration: `${hours}h${String(mins).padStart(2, "0")}min`,
      aircraft: routeData?.aircraft || (isDomestic ? "Boeing 737-800" : "Boeing 777-300ER"),
      cabin: { economy: "Econômica", premium: "Premium Economy", business: "Executiva", first: "Primeira Classe" }[cabinClass],
      baggage,
      wifi: !isDomestic || i % 2 === 0,
      meal: !isDomestic,
      lastSeen: lastSeenOptions[(hash + i) % lastSeenOptions.length],
      priceHistory,
      alliance: alliances[airlineCode] || "Independente",
      co2: `${co2Base} kg CO₂`,
    });
  }

  return results;
}

// ─── Components ───

function AirportAutocomplete({
  label, value, onChange, placeholder, icon,
}: {
  label: string; value: string; onChange: (code: string) => void; placeholder: string; icon: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase();
    return airports
      .filter(a =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      )
      .sort((a, b) => (b.hub ? 1 : 0) - (a.hub ? 1 : 0))
      .slice(0, 10);
  }, [query]);

  const selected = airports.find(a => a.code === value);

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
          {icon}
          <input
            type="text"
            placeholder={selected ? `${selected.flag} ${selected.city} (${selected.code})` : placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(""); }}
            onFocus={() => { setOpen(true); if (!query && !selected) setQuery(""); }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
          {selected && !query && (
            <button onClick={() => { onChange(""); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {open && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto"
            >
              {filtered.map((airport) => (
                <button
                  key={airport.code}
                  onMouseDown={(e) => { e.preventDefault(); onChange(airport.code); setQuery(""); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                >
                  <span className="text-lg">{airport.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{airport.city} ({airport.code})</p>
                      {airport.hub && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">HUB</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{airport.name} · {airport.country}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MiniPriceChart({ data, currentPrice }: { data: number[]; currentPrice: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data, currentPrice);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 200;
    const y = 40 - ((v - min) / range) * 35;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative">
      <p className="text-[10px] text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Histórico 30 dias</p>
      <svg viewBox="0 0 200 45" className="w-full h-10">
        <polyline fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeOpacity="0.3" points={points} />
        {/* Current price dot */}
        <circle cx={200} cy={40 - ((currentPrice - min) / range) * 35} r="3" fill="hsl(var(--primary))" />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>30d atrás</span>
        <span className="text-primary font-semibold">Hoje ↓</span>
      </div>
    </div>
  );
}

function PromoResultCard({ result, index, onFavorite, isFav }: { result: PromoResult; index: number; onFavorite: (id: string) => void; isFav: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const savings = result.marketPrice - result.promoPrice;
  const savingsPerPerson = savings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card overflow-hidden transition-shadow ${expanded ? "shadow-lg ring-1 ring-primary/20" : "hover:shadow-md"}`}
    >
      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://images.kiwi.com/airlines/64/${result.airlineCode}.png`}
              alt={result.airline}
              className="w-11 h-11 rounded-xl object-contain bg-white/10 p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
              }}
            />
            <div className="hidden w-11 h-11 rounded-xl bg-primary/10 items-center justify-center font-bold text-primary text-xs">
              {result.airlineCode}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm">{result.airline}</p>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{result.alliance}</span>
              </div>
              <p className="text-xs text-muted-foreground">{result.flightNumber} · {result.aircraft}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onFavorite(result.id); }}
              className={`p-1.5 rounded-lg transition-colors ${isFav ? "text-signal-red bg-signal-red/10" : "text-muted-foreground hover:text-signal-red hover:bg-signal-red/5"}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-signal-green/10 text-signal-green">
              -{result.discount}%
            </span>
          </div>
        </div>

        {/* Flight timeline */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">{result.departTime}</p>
            <p className="text-xs text-muted-foreground font-semibold">{result.originCode}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-[10px] text-muted-foreground">{result.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="h-px bg-border flex-1" />
              {result.stops > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: result.stops }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full border-2 border-primary bg-card" />
                  ))}
                </div>
              )}
              <div className="h-px bg-border flex-1" />
              <Plane className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {result.stops === 0 ? "Voo direto" : `${result.stops} parada${result.stops > 1 ? "s" : ""}${result.stopCity ? ` (${result.stopCity})` : ""}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground font-display">{result.returnTime}</p>
            <p className="text-xs text-muted-foreground font-semibold">{result.destCode}</p>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Luggage className="w-3 h-3" /> {result.baggage}
          </span>
          {result.wifi && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              <Wifi className="w-3 h-3" /> Wi-Fi
            </span>
          )}
          {result.meal && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              <UtensilsCrossed className="w-3 h-3" /> Refeição inclusa
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Briefcase className="w-3 h-3" /> {result.cabin}
          </span>
        </div>

        {/* Price + dates */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{result.type}</span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3" /> {result.lastSeen}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{result.departDate} — {result.returnDate}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground line-through text-sm block">R$ {result.marketPrice.toLocaleString("pt-BR")}</span>
            <span className="text-primary font-bold text-2xl font-display">R$ {result.promoPrice.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 bg-muted/30 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        {expanded ? "Ocultar detalhes" : "Detalhes completos"}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-t border-border space-y-5">
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Economia total</p>
                  <p className="font-bold text-signal-green text-lg font-display">R$ {savingsPerPerson.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Disponibilidade</p>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-signal-amber" />
                    <p className="font-bold text-signal-amber">{result.seats} assento{result.seats > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pegada de carbono</p>
                  <p className="font-medium text-foreground text-sm">{result.co2}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Aliança</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-gold" />
                    <p className="font-medium text-foreground text-sm">{result.alliance}</p>
                  </div>
                </div>
              </div>

              {/* Price history chart */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <MiniPriceChart data={result.priceHistory} currentPrice={result.promoPrice} />
              </div>

              {/* Alert box */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Tarifa detectada pela nossa IA</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Esta promoção pode expirar a qualquer momento. Membros PromoCéu recebem notificações instantâneas até 4 horas antes da publicação geral. O preço atual está {result.discount}% abaixo da média de mercado dos últimos 30 dias.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.a
                  href="#planos"
                  className="glow-button flex-1 text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Bell className="w-4 h-4" />
                  Ativar alerta para esta rota
                </motion.a>
                <button className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Quick search suggestions ───
const quickSearches = [
  { origin: "GRU", dest: "LIS", label: "São Paulo → Lisboa", emoji: "🇵🇹" },
  { origin: "GRU", dest: "MIA", label: "São Paulo → Miami", emoji: "🇺🇸" },
  { origin: "GRU", dest: "CDG", label: "São Paulo → Paris", emoji: "🇫🇷" },
  { origin: "GRU", dest: "DXB", label: "São Paulo → Dubai", emoji: "🇦🇪" },
  { origin: "GRU", dest: "NRT", label: "São Paulo → Tóquio", emoji: "🇯🇵" },
  { origin: "GRU", dest: "SSA", label: "São Paulo → Salvador", emoji: "🇧🇷" },
  { origin: "GIG", dest: "LIS", label: "Rio → Lisboa", emoji: "🇵🇹" },
  { origin: "GRU", dest: "MCO", label: "São Paulo → Orlando", emoji: "🇺🇸" },
];

// ─── Main component ───
export default function FlightSearchSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [directOnly, setDirectOnly] = useState(false);
  const [results, setResults] = useState<PromoResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchPhase, setSearchPhase] = useState(0);
  const [dataSource, setDataSource] = useState<"amadeus" | "simulated">("simulated");

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const cabinClassMap: Record<CabinClass, string> = {
    economy: "ECONOMY", premium: "PREMIUM_ECONOMY", business: "BUSINESS", first: "FIRST",
  };

  const runSearch = useCallback(async (orig: string, dest: string, depDate: string) => {
    setSearching(true);
    setResults(null);
    setSearchPhase(0);

    let phase = 0;
    const phaseInterval = setInterval(() => {
      phase++;
      if (phase < 5) setSearchPhase(phase);
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("search-flights", {
        body: {
          originCode: orig,
          destCode: dest,
          departureDate: depDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          adults: passengers,
          travelClass: cabinClassMap[cabinClass],
        },
      });

      clearInterval(phaseInterval);

      if (!error && data?.results?.length > 0 && !data?.fallback) {
        setResults(data.results);
        setDataSource("amadeus");
      } else {
        setResults(generatePromos(orig, dest, depDate, passengers, cabinClass));
        setDataSource("simulated");
      }
    } catch {
      clearInterval(phaseInterval);
      setResults(generatePromos(orig, dest, depDate, passengers, cabinClass));
      setDataSource("simulated");
    } finally {
      setSearching(false);
    }
  }, [passengers, cabinClass]);

  const handleSearch = () => {
    if (!origin || !destination) return;
    runSearch(origin, destination, date);
  };

  const handleQuickSearch = (qs: typeof quickSearches[0]) => {
    setOrigin(qs.origin);
    setDestination(qs.dest);
    setTimeout(() => runSearch(qs.origin, qs.dest, ""), 100);
  };

  const sortedResults = useMemo(() => {
    if (!results) return null;
    let sorted = [...results];
    if (directOnly) sorted = sorted.filter(r => r.stops === 0);
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "price": return a.promoPrice - b.promoPrice;
        case "duration": return parseInt(a.duration) - parseInt(b.duration);
        case "discount": return b.discount - a.discount;
        case "departure": return a.departTime.localeCompare(b.departTime);
        default: return 0;
      }
    });
    return sorted;
  }, [results, sortBy, directOnly]);

  const originAirport = airports.find(a => a.code === origin);
  const destAirport = airports.find(a => a.code === destination);
  const avgSavings = sortedResults ? Math.round(sortedResults.reduce((s, r) => s + r.marketPrice - r.promoPrice, 0) / sortedResults.length) : 0;
  const bestDiscount = sortedResults ? Math.max(...sortedResults.map(r => r.discount)) : 0;
  const directCount = results ? results.filter(r => r.stops === 0).length : 0;

  const searchPhases = [
    "Conectando à API Amadeus...",
    "Analisando 12.000+ tarifas em tempo real...",
    "Comparando preços de mercado...",
    "Filtrando melhores oportunidades...",
    "Calculando economia potencial...",
  ];


  return (
    <section id="simulador" className="relative py-24 px-4">
      <div className="section-divider w-full absolute top-0" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Simulador de passagens com IA</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Encontre sua próxima viagem com descontos reais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nossa inteligência artificial cruza dados de 47 fontes em tempo real, monitora erros tarifários, promoções relâmpago e tarifas especiais — comparando sempre com o preço de mercado para você ver exatamente quanto está economizando.
            </p>
          </div>
        </ScrollReveal>

        {/* Quick searches */}
        <ScrollReveal delay={0.05}>
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">Rotas populares — clique para buscar</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickSearches.map((qs, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleQuickSearch(qs)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium text-foreground/80"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{qs.emoji}</span>
                  {qs.label}
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Search form */}
        <ScrollReveal delay={0.1}>
          <div className="glass-card-highlight p-5 sm:p-7 mb-6">
            {/* Row 1: Origin / Swap / Destination */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4 items-end">
              <AirportAutocomplete label="Origem" value={origin} onChange={setOrigin} placeholder="De onde você sai?" icon={<MapPin className="w-4 h-4 text-primary flex-shrink-0" />} />
              <motion.button
                onClick={handleSwap}
                className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-colors mb-0.5"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                title="Inverter origem e destino"
              >
                <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
              <AirportAutocomplete label="Destino" value={destination} onChange={setDestination} placeholder="Para onde quer ir?" icon={<Plane className="w-4 h-4 text-primary flex-shrink-0" />} />
            </div>

            {/* Row 2: Dates + Passengers + Class */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ida</label>
                <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent outline-none text-sm text-foreground w-full" />
                </div>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Volta</label>
                <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="bg-transparent outline-none text-sm text-foreground w-full" />
                </div>
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Passageiros</label>
                <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="bg-transparent outline-none text-sm text-foreground w-full appearance-none cursor-pointer">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "adulto" : "adultos"}</option>)}
                  </select>
                </div>
              </div>
              <div className="w-full sm:w-40">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Classe</label>
                <div className="flex items-center gap-2 border border-border rounded-lg bg-card px-3 py-2.5">
                  <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                  <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)} className="bg-transparent outline-none text-sm text-foreground w-full appearance-none cursor-pointer">
                    <option value="economy">Econômica</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Executiva</option>
                    <option value="first">Primeira Classe</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced filters toggle */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Filter className="w-3.5 h-3.5" />
                {showFilters ? "Ocultar filtros" : "Filtros avançados"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              {origin && destination && (
                <p className="text-xs text-muted-foreground">
                  {realRoutes[`${origin}-${destination}`] ? (
                    <span className="flex items-center gap-1 text-signal-green"><Shield className="w-3 h-3" /> Rota com dados reais de voo</span>
                  ) : (
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Estimativa baseada em dados de mercado</span>
                  )}
                </p>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                      <input type="checkbox" checked={directOnly} onChange={(e) => setDirectOnly(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                      Apenas voos diretos
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search button */}
            <motion.button
              onClick={handleSearch}
              disabled={!origin || !destination || searching}
              className="glow-button w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {searching ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Buscando promoções com IA...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Buscar promoções
                </>
              )}
            </motion.button>
          </div>
        </ScrollReveal>

        {/* Loading animation */}
        <AnimatePresence mode="wait">
          {searching && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16">
              <div className="max-w-md mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 border-primary/20 border-t-primary rounded-full mx-auto mb-6"
                  style={{ borderWidth: 3 }}
                />
                <div className="space-y-3">
                  {searchPhases.map((phase, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= searchPhase ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      {i < searchPhase ? (
                        <div className="w-5 h-5 rounded-full bg-signal-green/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-signal-green" />
                        </div>
                      ) : i === searchPhase ? (
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        </div>
                      )}
                      <p className={`text-sm ${i <= searchPhase ? "text-foreground" : "text-muted-foreground/50"}`}>{phase}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {sortedResults && !searching && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Data source badge */}
              <div className="flex items-center gap-2 mb-4">
                {dataSource === "amadeus" ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-signal-green/10 text-signal-green border border-signal-green/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
                    ✅ Dados reais — API Amadeus
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    Dados simulados (cadastre credenciais para dados reais)
                  </span>
                )}
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-bold text-primary font-display">{sortedResults.length}</p>
                  <p className="text-[11px] text-muted-foreground">Promoções encontradas</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-bold text-signal-green font-display">-{bestDiscount}%</p>
                  <p className="text-[11px] text-muted-foreground">Maior desconto</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-bold text-foreground font-display">R$ {avgSavings.toLocaleString("pt-BR")}</p>
                  <p className="text-[11px] text-muted-foreground">Economia média</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-bold text-foreground font-display">{directCount}</p>
                  <p className="text-[11px] text-muted-foreground">Voos diretos</p>
                </div>
              </div>

              {/* Sort + filter bar */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-foreground font-semibold">
                  {originAirport?.city} ({origin}) <ArrowRight className="inline w-3.5 h-3.5 text-primary mx-1" /> {destAirport?.city} ({destination})
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground appearance-none cursor-pointer pr-6"
                  >
                    <option value="price">Menor preço</option>
                    <option value="discount">Maior desconto</option>
                    <option value="duration">Menor duração</option>
                    <option value="departure">Horário de partida</option>
                  </select>
                  <button
                    onClick={() => runSearch(origin, destination, date)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Atualizar
                  </button>
                </div>
              </div>


              {/* Result cards */}
              {sortedResults.length > 0 ? (
                <div className="grid gap-4">
                  {sortedResults.map((result, i) => (
                    <PromoResultCard
                      key={result.id}
                      result={result}
                      index={i}
                      onFavorite={toggleFavorite}
                      isFav={favorites.has(result.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass-card">
                  <Plane className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-semibold mb-1">Nenhum voo direto encontrado</p>
                  <p className="text-sm text-muted-foreground">Desative o filtro "Apenas voos diretos" para ver todas as opções.</p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 glass-card-highlight p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-display font-bold text-foreground">Quer receber alertas desta rota?</p>
                </div>
                <p className="text-muted-foreground text-sm mb-5 max-w-lg mx-auto">
                  Membros PromoCéu recebem notificações instantâneas quando tarifas como essas são detectadas — até 4 horas antes da publicação em sites de busca. Em média, nossos alertas duram apenas 47 minutos.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.a
                    href="#planos"
                    className="glow-button inline-flex items-center justify-center gap-2 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bell className="w-4 h-4" />
                    Ativar alertas para {destAirport?.city || "esta rota"}
                  </motion.a>
                  <motion.a
                    href="#planos"
                    className="px-6 py-3 border border-border rounded-lg text-sm font-semibold text-foreground/70 hover:text-primary hover:border-primary/30 transition-colors inline-flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Ver todos os planos
                    <ChevronRight className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
