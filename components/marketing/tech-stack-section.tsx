"use client";

import { motion } from "framer-motion";
import { Layout, Server, Cpu, Boxes } from "lucide-react";

const STACK = [
  { icon: Layout, title: "Frontend", items: ["Next.js", "Tailwind CSS", "TypeScript"] },
  { icon: Server, title: "Backend", items: ["FastAPI", "Node.js", "PostgreSQL"] },
  { icon: Cpu, title: "AI / ML", items: ["PyTorch", "TensorFlow", "OpenAI"] },
  { icon: Boxes, title: "Infra", items: ["Docker", "AWS", "Vercel"] },
];

export function TechStackSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Modern Tech Stack</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Built on tools trusted by teams shipping production weather intelligence.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STACK.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="glass rounded-xl p-5"
          >
            <span className="gradient-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
              <s.icon className="h-5 w-5 text-white" />
            </span>
            <h3 className="mb-3 text-sm font-semibold">{s.title}</h3>
            <ul className="space-y-1.5">
              {s.items.map((item) => (
                <li key={item} className="text-xs text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
