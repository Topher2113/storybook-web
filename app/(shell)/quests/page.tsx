"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { QuestToast, type ToastMessage } from "@/components/game/QuestToast";
import { Badge } from "@/components/ui/Badge";
import { abandonQuest as apiAbandonQuest } from "@/lib/api/state";
import { ApiError } from "@/lib/api/http";
import { prettifyId } from "@/lib/game/format";

let toastCounter = 1000;

export default function QuestsPage() {
  const { progress, dispatch, hydrated, questCatalog, ensureQuestCatalog } =
    useGame();
  const { token, handleAuthError } = useSession();
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    ensureQuestCatalog().catch(() => setLoadError(true));
  }, [ensureQuestCatalog]);

  const abandon = (questId: string) => {
    dispatch({ type: "ABANDON_QUEST", questId });
    if (token) {
      apiAbandonQuest(token, questId).catch((err) => {
        if (handleAuthError(err)) return;
        if (err instanceof ApiError && err.code === "CONFLICT") {
          setToast({ id: ++toastCounter, text: err.message, tone: "warn" });
        }
      });
    }
  };

  const done = questCatalog.filter(
    (q) => progress.quests[q.id]?.status === "completed",
  ).length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Quests</h1>
      <p className="mb-6 text-sm text-text/70">
        {hydrated && questCatalog.length > 0
          ? `${done} / ${questCatalog.length} completed · quests pay XP and bottle caps`
          : "Quests pay XP and bottle caps"}
      </p>

      {loadError && (
        <p className="rounded-2xl bg-surface p-4 text-sm">
          Couldn&apos;t load the quest board — the server may be waking up.
          Refresh in a moment.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {questCatalog.map((quest) => {
          const status = hydrated
            ? progress.quests[quest.id]?.status
            : undefined;
          return (
            <div key={quest.id} className="rounded-2xl bg-surface p-5">
              <div className="mb-1 flex items-start justify-between gap-3">
                <h2 className="text-xl text-text">{quest.title}</h2>
                {status === "completed" ? (
                  <Badge>Completed</Badge>
                ) : status === "active" ? (
                  <Badge className="bg-accent">Active</Badge>
                ) : null}
              </div>
              <p className="mb-3 text-sm text-text/80">{quest.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-text/60">
                  From{" "}
                  <Link
                    href={`/npcs/${quest.npc_slug}`}
                    className="font-bold text-primary underline"
                  >
                    {prettifyId(quest.npc_slug)}
                  </Link>{" "}
                  · reward {quest.reward_xp} XP + {quest.reward_xp} caps
                </span>
                {status === "active" && (
                  <span className="flex items-center gap-3">
                    <span className="text-text/60">
                      Target: {prettifyId(quest.target_scene)}
                    </span>
                    <button
                      type="button"
                      onClick={() => abandon(quest.id)}
                      className="text-xs text-text/50 underline hover:text-text"
                    >
                      Abandon
                    </button>
                  </span>
                )}
                {status === undefined || status === "abandoned" ? (
                  <span className="text-text/60">
                    Talk to them in the story to accept
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <QuestToast toast={toast} onDone={() => setToast(null)} />
    </main>
  );
}
