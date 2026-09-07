import React from "react";
import { CloudSun, CloudRain, ArrowRight, ShieldAlert } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white rounded-2xl p-8 border border-slate-800 my-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="flex items-center justify-between pb-8">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CloudSun className="w-5 h-5 text-white" />
          </div>
          <span>Weather<span className="text-blue-500">Framework</span></span>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold transition">
          Get Started
        </button>
      </header>

      {/* Hero Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
            AI-Powered Weather Intelligence
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Build Smarter Weather Solutions With <span className="text-blue-500">Weather Framework</span>
          </h1>
          <p className="text-slate-400 text-sm lg:text-base max-w-xl">
            A modular, open-source framework to integrate real-time weather data, forecasting models, and AI to build scalable applications.
          </p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-medium text-sm transition">
              Explore Framework <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400">📍 Bengaluru, KA</p>
                <p className="text-xs text-slate-400 mt-1">Current Weather</p>
                <h2 className="text-4xl font-bold mt-1">28°C</h2>
                <p className="text-sm font-medium text-slate-300">Partly Cloudy</p>
              </div>
              <CloudSun className="w-12 h-12 text-amber-400" />
            </div>
            <div className="flex gap-4 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <span>Humidity: 68%</span>
              <span>Wind: 12 km/h</span>
            </div>
          </div>

          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-200">Heavy Rain Alert</h4>
              <p className="text-xs text-red-300">Karnataka Coast — Valid till 08:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}