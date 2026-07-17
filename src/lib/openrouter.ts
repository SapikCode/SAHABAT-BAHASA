type OpenRouterEmbeddingResponse = {
  data: Array<{
    embedding: number[];
  }>;
};

type OpenRouterChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export function getOpenRouterEmbeddingModel() {
  return (
    process.env.OPENROUTER_EMBEDDING_MODEL ??
    process.env.OPENAI_EMBEDDING_MODEL ??
    "openai/text-embedding-3-small"
  );
}

export function getOpenRouterChatModel() {
  return process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash";
}

function getOpenRouterHeaders() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum diset.");
  }

  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
    "X-Title": process.env.OPENROUTER_APP_NAME ?? "Chatbot Tolaki",
  };
}

export function vectorLiteral(values: number[]) {
  return `[${values.map((value) => value.toFixed(8)).join(",")}]`;
}

export async function createEmbedding(input: string) {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      model: getOpenRouterEmbeddingModel(),
      input,
      encoding_format: "float",
      dimensions: 1536,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter embedding gagal: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as OpenRouterEmbeddingResponse;
  const embedding = data.data[0]?.embedding;

  if (!embedding) {
    throw new Error("OpenRouter embedding tidak mengembalikan vector.");
  }

  return embedding;
}

export async function createChatCompletion(messages: Array<{
  role: "system" | "user" | "assistant";
  content: string;
}>, maxTokens = 2048) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      model: getOpenRouterChatModel(),
      messages,
      temperature: 0.25,
      max_tokens: maxTokens,
      provider: {
        order: ["groq"]
      }
    }),
  });


  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter chat gagal: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      `OpenRouter chat tidak mengembalikan jawaban: ${JSON.stringify(data).slice(0, 500)}`,
    );
  }

  return content;
}
