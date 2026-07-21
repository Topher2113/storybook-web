"use client";

// The game orchestrator: fetches scenes, tracks visited/ending discovery,
// renders choices and NPC dialogs, and runs the quest pipeline. Mirrors the
// RN app's useStorySession flow (skeleton → scene → choices / ending → Play
// Again, error → Try Again) and adds resume, cloud save, quest accept/auto-
// complete, the caps/XP economy, and cold-start "waking" messaging.
//
// Scene-arrival order matters when signed in: the server's quest completion
// is location-gated, so PUT /api/state must land before PUT .../complete.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getNpcDialog } from "@/lib/api/npcs";
import {
  acceptQuest as apiAcceptQuest,
  completeQuest as apiCompleteQuest,
  savePlayerScene,
} from "@/lib/api/state";
import { getScene, getStartScene } from "@/lib/api/story";
import type { NpcDialog, NpcRef, Quest, Scene } from "@/lib/api/types";
import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { questOfferedBy, questsCompletableAt } from "@/lib/game/selectors";
import { ErrorPanel } from "./ErrorPanel";
import { NpcDialogModal } from "./NpcDialogModal";
import { QuestToast, type ToastMessage } from "./QuestToast";
import { SceneCard } from "./SceneCard";
import { SkeletonLoader } from "./SkeletonLoader";

let toastCounter = 0;

export function StoryScreen() {
  const { progress, dispatch, hydrated, questCatalog, ensureQuestCatalog } =
    useGame();
  const { token, handleAuthError } = useSession();
  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [npcDialog, setNpcDialog] = useState<NpcDialog | null>(null);
  const [npcLoadingId, setNpcLoadingId] = useState<string | null>(null);
  const [npcError, setNpcError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const started = useRef(false);

  // Latest progress/catalog for the async arrival pipeline, which must see
  // pre-dispatch quest state without re-creating callbacks every render.
  const progressRef = useRef(progress);
  const catalogRef = useRef(questCatalog);
  useEffect(() => {
    progressRef.current = progress;
    catalogRef.current = questCatalog;
  }, [progress, questCatalog]);

  useEffect(() => {
    ensureQuestCatalog().catch(() => {
      // Quest offers just won't render; the story itself is unaffected.
    });
  }, [ensureQuestCatalog]);

  const showToast = useCallback((text: string, tone: ToastMessage["tone"]) => {
    setToast({ id: ++toastCounter, text, tone });
  }, []);

  const arriveAt = useCallback(
    async (next: Scene) => {
      const before = progressRef.current;
      setScene(next);
      dispatch({ type: "GOTO_SCENE", sceneId: next.id });

      if (next.type === "ending") {
        const isNew = !before.discoveredEndings.includes(next.id);
        dispatch({ type: "DISCOVER_ENDING", endingId: next.id });
        if (isNew) {
          showToast("New ending discovered! +15 caps exploration bounty", "celebrate");
        }
      }

      const completable = questsCompletableAt(before, catalogRef.current, next.id);

      // Cloud save first (the server's quest completion is location-gated);
      // local-first state means failures never block the page turn.
      if (token) {
        try {
          await savePlayerScene(token, next.id);
        } catch (err) {
          handleAuthError(err);
        }
      }

      for (const quest of completable) {
        let rewardXp = quest.reward_xp;
        if (token) {
          try {
            rewardXp = (await apiCompleteQuest(token, quest.id)).rewardXp;
          } catch (err) {
            // Expired token or a quest the server never saw — the local
            // completion below is the source of truth for the economy.
            handleAuthError(err);
          }
        }
        dispatch({ type: "COMPLETE_QUEST", questId: quest.id, rewardXp });
        showToast(
          `Quest complete: ${quest.title} — +${rewardXp} XP, +${rewardXp} caps`,
          "celebrate",
        );
      }
    },
    [dispatch, token, handleAuthError, showToast],
  );

  const loadScene = useCallback(
    async (fetcher: () => Promise<Scene>) => {
      setLoading(true);
      setWaking(false);
      setError(null);
      try {
        await arriveAt(await fetcher());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [arriveAt],
  );

  const onWaking = useCallback(() => setWaking(true), []);

  const start = useCallback(() => {
    const saved = progressRef.current.currentScene;
    return loadScene(() =>
      saved ? getScene(saved, { onWaking }) : getStartScene({ onWaking }),
    );
  }, [loadScene, onWaking]);

  // Wait for hydration so a saved scene resumes instead of restarting.
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    void start();
  }, [hydrated, start]);

  const choose = (target: string) =>
    loadScene(() => getScene(target, { onWaking }));

  const talkTo = async (npc: NpcRef) => {
    if (!scene || npcLoadingId) return;
    setNpcLoadingId(npc.id);
    setNpcError(null);
    try {
      setNpcDialog(await getNpcDialog(scene.id, npc.id));
    } catch (err) {
      setNpcError(
        err instanceof Error ? err.message : "They don't want to talk.",
      );
    } finally {
      setNpcLoadingId(null);
    }
  };

  const acceptQuest = (quest: Quest) => {
    dispatch({ type: "ACCEPT_QUEST", questId: quest.id });
    if (token) {
      apiAcceptQuest(token, quest.id).catch((err) => handleAuthError(err));
    }
    showToast(`Quest accepted: ${quest.title}`, "info");
    setNpcDialog(null);
  };

  const playAgain = () => {
    dispatch({ type: "RESET_RUN" });
    setScene(null);
    void loadScene(() => getStartScene({ onWaking }));
  };

  if (!hydrated || loading) return <SkeletonLoader waking={waking} />;
  if (error) return <ErrorPanel message={error} onRetry={() => void start()} />;
  if (!scene) {
    return <ErrorPanel message="No story found." onRetry={() => void start()} />;
  }

  const isEnding = scene.type === "ending";
  const offeredQuest = npcDialog
    ? questOfferedBy(progress, questCatalog, npcDialog.npc.id)
    : undefined;

  return (
    <div className="w-full">
      <SceneCard scene={scene} />

      {scene.npcsPresent.length > 0 && !isEnding && (
        <div className="mt-5 flex flex-wrap gap-2">
          {scene.npcsPresent.map((npc) => (
            <button
              key={npc.id}
              type="button"
              onClick={() => void talkTo(npc)}
              disabled={npcLoadingId !== null}
              className="rounded-full border-2 border-primary px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/10 active:opacity-70 disabled:opacity-50"
            >
              {npcLoadingId === npc.id ? "…" : `Talk to ${npc.name}`}
            </button>
          ))}
        </div>
      )}
      {npcError && <p className="mt-2 text-sm text-accent">{npcError}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {isEnding ? (
          <>
            <p className="text-center text-sm text-text/70">
              The End · this ending is now in your{" "}
              <Link href="/endings" className="underline">
                gallery
              </Link>
            </p>
            <Button onClick={playAgain}>Play Again</Button>
          </>
        ) : scene.choices.length > 0 ? (
          scene.choices.map((choice) => (
            <Button key={choice.target} onClick={() => void choose(choice.target)}>
              {choice.text}
            </Button>
          ))
        ) : (
          <p className="text-center text-text/70">
            No paths forward were found.
          </p>
        )}
      </div>

      <NpcDialogModal
        dialog={npcDialog}
        onClose={() => setNpcDialog(null)}
        questSlot={
          offeredQuest && (
            <div className="mb-5 rounded-xl border border-primary/40 bg-background/50 p-4">
              <p className="mb-1 text-sm font-bold text-primary">
                📜 Quest: {offeredQuest.title}
              </p>
              <p className="mb-3 text-sm text-text/80">
                {offeredQuest.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text/60">
                  Reward: {offeredQuest.reward_xp} XP ·{" "}
                  {offeredQuest.reward_xp} caps
                </span>
                <Button onClick={() => acceptQuest(offeredQuest)}>
                  Accept
                </Button>
              </div>
            </div>
          )
        }
      />

      <QuestToast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}
