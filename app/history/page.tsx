"use client";

import { useEffect, useState } from "react";
import { Trash2, MessageSquare, ChevronDown, ChevronUp, Bot, User, Clock, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/state";
import { cn } from "@/lib/utils";

interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  location?: { name: string } | null;
  messages: { id: string; role: string; content: string }[];
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    setDeleting(id);
    try {
      await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch { /* silent */ }
    setDeleting(null);
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Conversation History</h1>
          <p className="text-sm text-muted-foreground">Your past AI Copilot sessions</p>
        </div>
        {conversations.length > 0 && (
          <Badge tone="default">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      {loading && <LoadingState label="Loading conversation history..." />}

      {!loading && conversations.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          message="No conversations yet. Start chatting with the AI Copilot to see your history here."
        />
      )}

      <div className="space-y-3 animate-fade-in">
        {conversations.map((c) => {
          const isOpen = expanded === c.id;
          const msgCount = c.messages.length;
          const firstUser = c.messages.find((m) => m.role === "user")?.content ?? "";
          const preview = firstUser.length > 80 ? firstUser.slice(0, 80) + "…" : firstUser;

          return (
            <Card key={c.id} className={cn("transition-all", isOpen && "shadow-card-hover")}>
              <CardContent className="p-0">
                {/* Header row */}
                <button
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/30 rounded-t-xl transition-colors"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{c.title || "Conversation"}</p>
                      <Badge tone="default">{msgCount} msg{msgCount !== 1 ? "s" : ""}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview || "No messages"}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {c.location?.name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{c.location.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                      disabled={deleting === c.id}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded messages */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    {c.messages.map((m) => (
                      <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                          m.role === "user" ? "gradient-accent text-white" : "bg-muted border border-border"
                        )}>
                          {m.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                        </div>
                        <div className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                          m.role === "user" ? "gradient-accent text-white rounded-tr-sm" : "bg-muted border border-border rounded-tl-sm"
                        )}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
