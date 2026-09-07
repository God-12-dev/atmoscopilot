"use client";

import { useState } from "react";
import Link from "next/link";
import { CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTE: sending the actual reset email requires an email provider
    // (e.g. Resend, SendGrid) wired up server-side. This UI is ready to
    // connect to that endpoint once you add one — see README.
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-center gap-2">
            <CloudSun className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Reset your password</h1>
            <p className="text-center text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {submitted ? (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              If an account exists for {email}, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm">Email</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
