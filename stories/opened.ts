import { mirrored, type Mirror, type MirroredStory } from "./story.ts";

type Play = { readonly play: (context: { readonly canvasElement: HTMLElement }) => Promise<void> };

/**
 * Ends every finite animation on the element and its subtree now, so the story shows the opened overlay
 * at rest. Awaiting animation.finished instead hung a play for as long as Firefox left the document
 * timeline frozen with the transitions still pending (.verify/drop-in/stall/).
 */
export function settle(element: Element): void {
  for (const animation of element.getAnimations({ subtree: true })) {
    if (animation.effect?.getComputedTiming().endTime !== Infinity) animation.finish();
  }
}

/** A mirrored story whose play opens the overlay with this id from its trigger, as a click would, and settles it open. */
export function opened<Args>(id: string, mirror: Mirror<Args>): MirroredStory<Args> & Play {
  return {
    ...mirrored(mirror),
    play: async ({ canvasElement }) => {
      const target = CSS.escape(id);
      canvasElement.querySelector<HTMLButtonElement>(`[commandfor="${target}"]:is([command="show-modal"], [command="toggle-popover"])`)!.click();
      const overlay = canvasElement.querySelector(`#${target}`)!;
      if (!overlay.matches(":modal, :popover-open")) throw new Error(`#${id} did not open from its trigger`);
      settle(overlay);
    },
  };
}
