export type ActionCollection = "immediateAction" | "ongoingAction";

const ACTION_ITEM_PREFIXES: Record<ActionCollection, string> = {
  immediateAction: "action-items-",
  ongoingAction: "in-the-meantime-"
};

export function getActionItemPublicSlug(
  fileSlug: string,
  collection: ActionCollection
): string {
  const prefix = ACTION_ITEM_PREFIXES[collection];
  return fileSlug.startsWith(prefix) ? fileSlug.slice(prefix.length) : fileSlug;
}
