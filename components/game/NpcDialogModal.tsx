"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { NpcDialog } from "@/lib/api/types";

// Centered dialog matching the RN NpcDialogModal: NPC name, italic
// description, dialog body, Close. The quest slot lets the game layer add
// an Accept-quest offer without this component knowing quest rules.
export function NpcDialogModal({
  dialog,
  onClose,
  questSlot,
}: {
  dialog: NpcDialog | null;
  onClose: () => void;
  questSlot?: React.ReactNode;
}) {
  return (
    <Modal open={dialog !== null} onClose={onClose} labelledBy="npc-name">
      {dialog && (
        <>
          <h2 id="npc-name" className="mb-1 text-xl text-primary">
            {dialog.npc.name}
          </h2>
          <p className="mb-4 text-sm italic text-text/70">
            {dialog.npc.description}
          </p>
          <p className="mb-5 whitespace-pre-line leading-relaxed">
            &ldquo;{dialog.dialog}&rdquo;
          </p>
          {questSlot}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
