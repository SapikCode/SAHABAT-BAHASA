export function createClientId(prefix = "id") {
  const randomUuid = globalThis.crypto?.randomUUID?.();

  if (randomUuid) {
    return randomUuid;
  }

  const randomPart = globalThis.crypto?.getRandomValues
    ? Array.from(globalThis.crypto.getRandomValues(new Uint32Array(2)))
        .map((value) => value.toString(36))
        .join("")
    : Math.random().toString(36).slice(2);

  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

