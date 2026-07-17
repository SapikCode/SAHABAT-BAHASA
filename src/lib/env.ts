export const env = {
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash",
  openRouterEmbeddingModel:
    process.env.OPENROUTER_EMBEDDING_MODEL ??
    process.env.OPENAI_EMBEDDING_MODEL ??
    "openai/text-embedding-3-small",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
