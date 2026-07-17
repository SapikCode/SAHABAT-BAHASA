export type DictionaryInput = {
  kata_tolaki: string;
  arti_indonesia: string;
  kalimat_tolaki?: string | null;
  kalimat_indonesia?: string | null;
};

export function buildDictionaryContent(input: DictionaryInput) {
  return [
    ["Kata Tolaki", input.kata_tolaki],
    ["Arti Indonesia", input.arti_indonesia],
    ["Kalimat Tolaki", input.kalimat_tolaki],
    ["Kalimat Indonesia", input.kalimat_indonesia],
  ]
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => `${label}: ${value?.trim()}`)
    .join("\n");
}

