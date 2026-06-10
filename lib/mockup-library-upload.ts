export type MockupLibraryEntry = {
  id: string;
  kind: "image" | "video";
  url: string;
};

function pickKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Persistable library entries (data URLs survive reload and autosave). */
export async function filesToDataUrlLibraryItems(
  files: FileList
): Promise<MockupLibraryEntry[]> {
  const additions: MockupLibraryEntry[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const kind = pickKind(file);
    if (!kind) continue;
    const url = await readFileAsDataUrl(file);
    additions.push({
      id: crypto.randomUUID(),
      kind,
      url,
    });
  }
  return additions;
}
