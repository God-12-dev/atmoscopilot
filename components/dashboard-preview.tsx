import React from "react";
import { Search, Bell, Sun, Database, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="light-card rounded-2xl p-6 text-slate-900 shadow-xl border border-slate-200 my-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
          <span>Weather Framework</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search location..." 
              className="pl-9 pr-4 py-1.5 bg-slate-100 text-xs rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>
          <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Bell className="w-4 h-4 text-slate-600" /></button>
          <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Sun className="w-4 h-4 text-slate-600" /></button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">Data Sources</p>
          <h3 className="text-2xl font-bold mt-1">12</h3>
          <span className="text-xs text-emerald-600 font-medium">Active</span>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">API Calls</p>
          <h3 className="text-2xl font-bold mt-1">8.4M</h3>
          <span className="text-xs text-slate-500">This Month</span>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">Alerts Sent</p>
          <h3 className="text-2xl font-bold mt-1">156</h3>
          <span className="text-xs text-slate-500">This Week</span>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">Model Accuracy</p>
          <h3 className="text-2xl font-bold mt-1">92.6%</h3>
          <span className="text-xs text-slate-500">Last 7 Days</span>
        </div>
      </div>
    </div>
  );
}