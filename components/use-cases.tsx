import React from "react";

export default function UseCases() {
  const cases = [
    { title: "Farmers", desc: "Get crop advisories, weather forecasts & alerts in local language." },
    { title: "Disaster Managers", desc: "Early warnings, real-time updates & decision support." },
    { title: "Developers", desc: "Build weather apps faster with powerful APIs & tools." },
    { title: "Researchers", desc: "Access datasets & models for climate and weather research." },
    { title: "Businesses", desc: "Make data-driven decisions with accurate weather intelligence." }
  ];

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Built For Every Use Case</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cases.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/40 transition">
            <h3 className="font-semibold text-sm text-blue-400 mb-2">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}