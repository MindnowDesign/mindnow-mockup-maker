function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function doubleRAF(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * Waits for fonts, loaded images, and video frames so html-to-image sees the same pixels as the user.
 * Bounded by `timeoutMs` so Save never hangs indefinitely (e.g. stuck `img.decode()`).
 */
export async function waitForCaptureReady(
  container: HTMLElement,
  timeoutMs = 8000
): Promise<void> {
  await Promise.race([
    (async () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const imgs = [...container.querySelectorAll("img")];
      for (const img of imgs) {
        if (!img.complete) {
          await Promise.race([
            new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
            sleep(2500),
          ]);
        }
      }

      const videos = [...container.querySelectorAll("video")];
      for (const video of videos) {
        try {
          video.pause();
        } catch {
          /* ignore */
        }
        await Promise.race([
          new Promise<void>((resolve) => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              resolve();
              return;
            }
            video.addEventListener("loadeddata", () => resolve(), { once: true });
            video.addEventListener("error", () => resolve(), { once: true });
          }),
          sleep(2500),
        ]);
      }

      await doubleRAF();
    })(),
    sleep(timeoutMs),
  ]);
}
