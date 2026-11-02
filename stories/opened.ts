import { mirrored, type Mirror, type MirroredStory } from "./mirror.ts";

type Play = { readonly play: (context: { readonly canvasElement: HTMLElement }) => Promise<void> };

/** A mirrored story whose play opens the overlay with this id from its trigger, as a click would, and waits for it to finish animating in. */
export function opened<Args>(id: string, mirror: Mirror<Args>): MirroredStory<Args> & Play {
  return {
    ...mirrored(mirror),
    play: async ({ canvasElement }) => {
      const target = CSS.escape(id);
      canvasElement.querySelector<HTMLButtonElement>(`[commandfor="${target}"]:is([command="show-modal"], [command="toggle-popover"])`)!.click();
      await Promise.all(canvasElement.querySelector(`#${target}`)!.getAnimations({ subtree: true }).map((animation) => animation.finished));
    },
  };
}
