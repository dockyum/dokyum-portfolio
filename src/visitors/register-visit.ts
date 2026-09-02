export type VisitorStore = {
  get(): Promise<number>;
  increment(): Promise<number>;
};

export async function registerVisit(
  store: VisitorStore,
  alreadyCounted: boolean,
): Promise<{ count: number; setCookie: boolean }> {
  if (alreadyCounted) {
    return { count: await store.get(), setCookie: false };
  }

  return { count: await store.increment(), setCookie: true };
}
