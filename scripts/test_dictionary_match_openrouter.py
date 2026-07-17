import argparse
import json

from ingest_dictionary_openrouter import (
    ROOT,
    embed_batch,
    load_env,
    normalize_embedding_model,
    post_json,
    require_env,
    vector_literal,
)


def main():
    parser = argparse.ArgumentParser(
        description="Test dictionary vector search with an OpenRouter embedding query."
    )
    parser.add_argument("query")
    parser.add_argument("--match-count", type=int, default=5)
    args = parser.parse_args()

    env = load_env(ROOT / ".env.local")
    openrouter_api_key = require_env(env, "OPENROUTER_API_KEY")
    supabase_url = require_env(env, "NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") or env.get(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    if not supabase_key:
        raise RuntimeError(
            "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )

    embedding = embed_batch(
        [args.query],
        openrouter_api_key,
        normalize_embedding_model(
            env.get("OPENROUTER_EMBEDDING_MODEL") or env.get("OPENAI_EMBEDDING_MODEL")
        ),
        env.get("OPENROUTER_SITE_URL") or "http://localhost:3000",
        env.get("OPENROUTER_APP_NAME") or "Chatbot Tolaki",
    )[0]

    matches = post_json(
        f"{supabase_url.rstrip('/')}/rest/v1/rpc/match_dictionary_documents",
        {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
        },
        {
            "p_query_embedding": vector_literal(embedding),
            "p_match_count": args.match_count,
            "p_query_text": args.query,
        },
    )
    print(json.dumps(matches, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
