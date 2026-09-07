import Link from "next/link";
import {
  CloudSun, Zap, Wheat, Route, FileWarning, LineChart,
  Shield, MapPin, Bot, Globe, ArrowRight, CheckCircle,
  CloudRain, Wind, Thermometer, Eye, Mic
} from "lucide-react";

const FEATURES = [
  { icon: CloudSun,    title: "Multi-Source Weather Intelligence",   desc: "Real-time weather, radar, satellite and sensor data for any location in India." },
  { icon: Bot,         title: "AI Weather Copilot",                  desc: "Ask questions in 8 Indian languages. Grounded in live weather data for accurate answers." },
  { icon: Zap,         title: "Disaster Early Warning",              desc: "Flash flood prediction, cloudburst detection, storm severity and evacuation routing." },
  { icon: CloudRain,   title: "Flood Inundation Intelligence",       desc: "Risk timelines, affected zones, water accumulation maps and shelter locations." },
  { icon: Wheat,       title: "Weather-Smart Agriculture",           desc: "Crop-specific advisory for irrigation, spraying, harvest timing and disease risk." },
  { icon: Route,       title: "Climate-Resilient Route Planning",    desc: "Weather-aware routing for emergency vehicles, ambulances and logistics fleets." },
  { icon: FileWarning, title: "Citizen Incident Reporting",          desc: "Community-powered hazard reporting with GPS, photos and authority status updates." },
  { icon: Mic,         title: "Multilingual Voice Assistant",        desc: "Speak in Kannada, Hindi, Tamil, Telugu, Bengali and 4 more languages." },
  { icon: Shield,      title: "Emergency Evacuation Routing",        desc: "Nearest shelters, safe routes, and one-tap access to NDRF and emergency services." },
  { icon: LineChart,   title: "Climate Intelligence",                desc: "Temperature anomalies, extreme event frequency, rainfall trends and historical analysis." },
];

const USE_CASES = [
  {
    icon: "👨‍🌾",
    title: "Farmers",
    color: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/30",
    items: ["Weather-based crop advice", "Rain forecast for irrigation", "Fungal disease risk alerts", "Harvest timing recommendations"],
  },
  {
    icon: "🛡️",
    title: "Disaster Managers",
    color: "from-red-500/20 to-orange-500/10",
    border: "border-red-500/30",
    items: ["Flood intelligence & risk maps", "Citizen incident reports", "Emergency team coordination", "Alert broadcasting system"],
  },
  {
    icon: "🚛",
    title: "Logistics",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    items: ["Weather-aware route planning", "Flood zone avoidance", "Visibility & wind analysis", "ETA risk assessment"],
  },
  {
    icon: "🔬",
    title: "Researchers",
    color: "from-purple-500/20 to-violet-500/10",
    border: "border-purple-500/30",
    items: ["Climate trend analytics", "Historical comparisons", "Temperature anomaly data", "Extreme event frequency"],
  },
  {
    icon: "🏙️",
    title: "Citizens",
    color: "from-sky-500/20 to-blue-500/10",
    border: "border-sky-500/30",
    items: ["Hyperlocal weather updates", "Travel safety advisories", "SOS & shelter locator", "Community hazard reports"],
  },
  {
    icon: "⚕️",
    title: "Emergency Teams",
    color: "from-orange-500/20 to-amber-500/10",
    border: "border-orange-500/30",
    items: ["Real-time disaster alerts", "Safe routing to incidents", "Nearest shelter maps", "Direct emergency contacts"],
  },
];

const STATS = [
  { value: "8+",  label: "Languages supported" },
  { value: "10+", label: "Intelligence layers" },
  { value: "Live",label: "Real-time weather data" },
  { value: "Free",label: "Open for citizens" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <span className="gradient-accent glow-sm flex h-8 w-8 items-center justify-center rounded-lg">
              <CloudSun className="h-4.5 w-4.5 text-white" style={{ height: 18, width: 18 }} />
            </span>
            WeatherGPT
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {[["Features", "#features"], ["Use Cases", "#usecases"], ["Technology", "#tech"]].map(([l, h]) => (
              <a key={l} href={h} className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="gradient-accent glow-sm rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-20 md:px-8 md:py-32">
        {/* Background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute left-0 bottom-1/4 h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Smart India Hackathon 2025 Project
              </div>

              <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                AI-Powered Weather{" "}
                <span className="gradient-text">Intelligence</span>{" "}
                for a Safer Future
              </h1>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
                WeatherGPT transforms real-time weather, forecasts, AI, disaster intelligence and
                hyper-local insights into actionable decisions for citizens, farmers,
                emergency teams and businesses.
              </p>

              {/* Feature pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {["Real-Time Weather", "AI Intelligence", "Disaster Alerts", "Agricultural Advisory", "Emergency Routing", "Hyper-Local"].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle className="h-3 w-3" />{f}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="gradient-accent glow flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity">
                  View Live Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/disaster" className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:bg-muted transition-colors">
                  <Zap className="h-4 w-4 text-primary" /> Explore Disaster Intel
                </Link>
              </div>
            </div>

            {/* Right — live weather preview cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                {/* Main weather card */}
                <div className="col-span-2 rounded-2xl border border-border bg-card shadow-elevated p-5 bg-gradient-to-br from-sky-500/10 to-blue-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bengaluru, Karnataka</p>
                      <p className="text-5xl font-bold mt-1">28°C</p>
                      <p className="text-sm text-muted-foreground mt-1">Partly Cloudy · Feels 31°C</p>
                    </div>
                    <div className="text-5xl">⛅</div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    {[["💧", "61%", "Humidity"], ["💨", "13 km/h", "Wind"], ["👁️", "10 km", "Visibility"], ["📊", "1011 hPa", "Pressure"]].map(([icon, val, lbl]) => (
                      <div key={lbl} className="rounded-lg bg-muted/50 py-2">
                        <div className="text-base">{icon}</div>
                        <div className="font-semibold mt-0.5">{val}</div>
                        <div className="text-muted-foreground">{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disaster risk card */}
                <div className="rounded-2xl border border-orange-500/40 bg-orange-500/8 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <p className="text-xs font-semibold">Flood Risk</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">HIGH</p>
                  <p className="text-xs text-muted-foreground mt-1">Rain 68% · 82 mm/hr</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">Avoid underpasses</p>
                </div>

                {/* AI Copilot card */}
                <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold">AI Copilot</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    &ldquo;Rain likely at 3 PM. Farmers: delay irrigation. Avoid Ring Road underpass.&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                    <Globe className="h-3 w-3" /> 8 languages
                  </div>
                </div>

                {/* Agri advisory mini card */}
                <div className="rounded-2xl border border-green-500/30 bg-green-500/8 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wheat className="h-4 w-4 text-green-500" />
                    <p className="text-xs font-semibold">Agri Advisory</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Tomato · Disease Risk:</p>
                  <p className="text-sm font-bold text-orange-500">HIGH</p>
                  <p className="text-xs text-muted-foreground">Delay irrigation today</p>
                </div>

                {/* Route mini card */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/8 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-semibold">Safe Route</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Route B · ETA 41 min</p>
                  <p className="text-sm font-bold text-green-500">LOW RISK</p>
                  <p className="text-xs text-muted-foreground">Elevated corridor</p>
                </div>
              </div>

              {/* Floating live badge */}
              <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/15 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50 py-10 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold gradient-text">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Platform Capabilities</p>
            <h2 className="text-3xl font-bold md:text-4xl">More than weather. Much more.</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              WeatherGPT is an AI-powered hyper-local weather intelligence and disaster resilience platform
              built for India&apos;s diverse geography, communities and emergency needs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
              >
                <div className="gradient-accent mb-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-sm mb-1.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ───────────────────────────────────────────── */}
      <section id="usecases" className="bg-card/30 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Who Is It For</p>
            <h2 className="text-3xl font-bold md:text-4xl">Built for every stakeholder</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map(({ icon, title, color, border, items }) => (
              <div key={title} className={`rounded-2xl border ${border} bg-gradient-to-br ${color} p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{icon}</span>
                  <p className="font-bold text-lg">{title}</p>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ──────────────────────────────────────────── */}
      <section id="tech" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Technology Stack</p>
            <h2 className="text-3xl font-bold md:text-4xl">Built on proven technology</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { category: "Frontend",  color: "from-blue-500/15",   items: [["Next.js 14", "Implemented"], ["React + TypeScript", "Implemented"], ["Tailwind CSS", "Implemented"], ["Recharts", "Implemented"]] },
              { category: "AI & NLP",  color: "from-purple-500/15", items: [["Google Gemini", "Implemented"], ["Web Speech API", "Implemented"], ["Multilingual", "Implemented"], ["LLM Integration", "Implemented"]] },
              { category: "Data",      color: "from-green-500/15",  items: [["OpenWeather API", "Implemented"], ["Leaflet Maps", "Implemented"], ["PostgreSQL + Prisma", "Implemented"], ["ERA5 / IMD", "Integration-ready"]] },
              { category: "ML / AI",   color: "from-orange-500/15", items: [["Rule-based Risk", "Implemented"], ["XGBoost Flood", "Integration-ready"], ["LSTM Forecast", "Integration-ready"], ["Satellite ML", "Planned"]] },
            ].map(({ category, color, items }) => (
              <div key={category} className={`rounded-2xl border border-border bg-gradient-to-b ${color} to-transparent p-5`}>
                <p className="font-bold mb-3 text-sm uppercase tracking-wide text-muted-foreground">{category}</p>
                <div className="space-y-2">
                  {items.map(([tech, status]) => (
                    <div key={tech} className="flex items-center justify-between">
                      <span className="text-sm">{tech}</span>
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        status === "Implemented" ? "bg-green-500/15 text-green-600 dark:text-green-400" :
                        status === "Integration-ready" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                        "bg-muted text-muted-foreground"
                      }`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 px-8 py-16 shadow-elevated">
            <div className="gradient-accent glow mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <CloudSun className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold md:text-4xl mb-4">
              Start Exploring <span className="gradient-text">WeatherGPT</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Experience real-time weather intelligence, AI copilot, disaster early warning
              and agricultural advisory — all in one platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/dashboard" className="gradient-accent glow flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white hover:opacity-90 transition-opacity">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/disaster" className="flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 font-semibold hover:bg-muted transition-colors">
                <Zap className="h-4 w-4 text-primary" /> Disaster Intelligence
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="gradient-accent flex h-7 w-7 items-center justify-center rounded-lg">
              <CloudSun className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold">WeatherGPT</span>
            <span className="text-xs text-muted-foreground">AI Weather Intelligence Platform</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for Smart India Hackathon · Data from OpenWeather API · Maps by OpenStreetMap
          </p>
        </div>
      </footer>
    </div>
  );
}
