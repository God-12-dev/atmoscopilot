import React from "react";

export default function TechStack() {
  const stack = [
    { title: "Frontend", desc: "React, TypeScript, Tailwind CSS" },
    { title: "Backend", desc: "Node.js, Python, FastAPI" },
    { title: "Data & Cache", desc: "PostgreSQL, MongoDB, Redis" },
    { title: "AI / ML", desc: "PyTorch, TensorFlow, scikit-learn" },
    { title: "Infra & DevOps", desc: "Docker, Kubernetes, AWS / GCP" },
    { title: "Data Sources", desc: "APIs, Satellites, Radars, IoT" },
  ];

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold text-center mb-6">Modern Technology Stack</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stack.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <h3 className="font-semibold text-sm text-blue-400 mb-1">{item.title}</h3>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}