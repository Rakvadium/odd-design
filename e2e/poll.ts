/**
 * Calls `read`, a short page read, every 100 ms until one returns something other than null. Each
 * read starts on the timer, not after the one before returns: under load, Firefox can hold a read
 * until another message reaches the page. Waiting on that one read timed out 10 to 30 s after the
 * page saw the popover open (.verify/drop-in/hover/), and hung a whole axe run in openStory
 * (.verify/drop-in/build/full-2-axe-hang/).
 */
export function poll<T>(read: () => Promise<T | null>, timeout = 30_000): Promise<T> {
  return new Promise((resolve, reject) => {
    let last: unknown = null;
    const timer = setInterval(() => {
      read().then(
        (value) => {
          if (value === null) return;
          clearInterval(timer);
          clearTimeout(limit);
          resolve(value);
        },
        (error: unknown) => (last = error),
      );
    }, 100);
    const limit = setTimeout(() => {
      clearInterval(timer);
      reject(new Error(`no page read returned a value in ${timeout} ms${last === null ? "" : `, last error: ${String(last)}`}`));
    }, timeout);
  });
}
