"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ValidateAccordClient({ token }: { token: string }) {
  const router = useRouter();
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle(action: "accept" | "reject") {
    setLoading(true);
    const res = await fetch(`/api/accords/${token}/valider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, commentaire: commentaire || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div>
        <Label htmlFor="commentaire">Commentaire (optionnel, en cas de refus)</Label>
        <textarea
          id="commentaire"
          className="mt-1.5 min-h-[80px] w-full rounded-md border-[1.5px] border-neutral-200 px-3.5 py-3 text-[15px]"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1"
          onClick={() => handle("accept")}
          loading={loading}
        >
          J&apos;accepte cet accord
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => handle("reject")}
          disabled={loading}
        >
          Je refuse
        </Button>
      </div>
    </div>
  );
}
