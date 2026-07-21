"use client";

import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { addInventoryItem } from "@/lib/api/state";
import { canAfford, capsBalance, ownsItem } from "@/lib/game/selectors";

// Shop purchases are a client-side mechanic: the API prices stock in caps but
// has no buy endpoint, so buying deducts local caps and (when signed in)
// records the item in the server inventory.
export function BuyButton({
  itemId,
  price,
}: {
  itemId: string;
  price: number;
}) {
  const { progress, dispatch, hydrated } = useGame();
  const { token, handleAuthError } = useSession();

  if (!hydrated) {
    return <div className="animate-skeleton h-10 w-24 rounded-xl bg-background" />;
  }

  if (ownsItem(progress, itemId)) {
    return <span className="text-sm text-text/60">Already owned</span>;
  }

  const affordable = canAfford(progress, price);
  const buy = () => {
    dispatch({ type: "BUY_ITEM", itemId, price });
    if (token) {
      addInventoryItem(token, itemId).catch((err) => handleAuthError(err));
    }
  };

  return (
    <span className="flex flex-col items-end gap-1">
      <Button onClick={buy} disabled={!affordable}>
        Buy · {price} caps
      </Button>
      {!affordable && (
        <span className="text-xs text-text/50">
          Need {price - capsBalance(progress)} more caps
        </span>
      )}
    </span>
  );
}
