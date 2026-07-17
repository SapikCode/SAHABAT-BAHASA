import argparse
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import openpyxl


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = ROOT / "outputs" / "kamus_tolaki_final.xlsx"
INGEST_TOKEN = "tolaki_ingest_2026_06_temporary"


def load_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def require_env(env: dict[str, str], key: str) -> str:
    value = env.get(key)
    if not value:
        raise RuntimeError(f"Missing required env: {key}")
    return value


def normalize_embedding_model(model: str | None) -> str:
    if not model:
        return "openai/text-embedding-3-small"
    if "/" not in model and model.startswith("text-embedding"):
        return f"openai/{model}"
    return model


def clean_cell(value: object) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text == "-" else " ".join(text.split())


def build_content(row: dict[str, object]) -> str:
    parts = [
        f"Kata Tolaki: {row['kata_tolaki']}",
        f"Arti Indonesia: {row['arti_indonesia']}",
    ]
    if row["kalimat_tolaki"]:
        parts.append(f"Contoh kalimat Tolaki: {row['kalimat_tolaki']}")
    if row["kalimat_indonesia"]:
        parts.append(f"Terjemahan contoh: {row['kalimat_indonesia']}")
    return "\n".join(parts)


def read_dictionary_rows(path: Path, limit: int | None = None) -> list[dict[str, object]]:
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    sheet = workbook.active
    rows: list[dict[str, object]] = []

    for excel_row, values in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        kata_tolaki = clean_cell(values[0] if len(values) > 0 else "")
        arti_indonesia = clean_cell(values[1] if len(values) > 1 else "")
        kalimat_tolaki = clean_cell(values[2] if len(values) > 2 else "")
        kalimat_indonesia = clean_cell(values[3] if len(values) > 3 else "")

        if not kata_tolaki or not arti_indonesia:
            continue

        row = {
            "source": path.name,
            "source_row": excel_row,
            "kata_tolaki": kata_tolaki,
            "arti_indonesia": arti_indonesia,
            "kalimat_tolaki": kalimat_tolaki,
            "kalimat_indonesia": kalimat_indonesia,
            "metadata": {
                "kind": "dictionary_entry",
                "source_file": path.name,
                "excel_row": excel_row,
            },
        }
        row["content"] = build_content(row)
        rows.append(row)

        if limit and len(rows) >= limit:
            break

    return rows


def post_json(url: str, headers: dict[str, str], payload: dict[str, object], retries: int = 5):
    body = json.dumps(payload).encode("utf-8")
    request = Request(url, data=body, headers=headers, method="POST")

    for attempt in range(retries):
        try:
            with urlopen(request, timeout=90) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            if error.code in {429, 500, 502, 503, 504} and attempt < retries - 1:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"POST {url} failed: HTTP {error.code} {detail}") from error
        except URLError as error:
            if attempt < retries - 1:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"POST {url} failed: {error}") from error

    raise RuntimeError(f"POST {url} failed after {retries} retries")


def embed_batch(
    texts: list[str],
    openrouter_api_key: str,
    model: str,
    site_url: str,
    app_name: str,
) -> list[list[float]]:
    data = post_json(
        "https://openrouter.ai/api/v1/embeddings",
        {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": site_url,
            "X-Title": app_name,
        },
        {
            "model": model,
            "input": texts,
            "encoding_format": "float",
            "dimensions": 1536,
        },
    )
    embeddings = [item["embedding"] for item in data["data"]]
    if len(embeddings) != len(texts):
        raise RuntimeError(
            f"Embedding count mismatch: got {len(embeddings)}, expected {len(texts)}"
        )
    return embeddings


def vector_literal(values: list[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in values) + "]"


def upsert_row(
    supabase_url: str,
    supabase_key: str,
    row: dict[str, object],
    embedding: list[float],
):
    return post_json(
        f"{supabase_url.rstrip('/')}/rest/v1/rpc/upsert_dictionary_document_for_ingest",
        {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
        },
        {
            "p_ingest_token": INGEST_TOKEN,
            "p_source": row["source"],
            "p_source_row": row["source_row"],
            "p_kata_tolaki": row["kata_tolaki"],
            "p_arti_indonesia": row["arti_indonesia"],
            "p_kalimat_tolaki": row["kalimat_tolaki"],
            "p_kalimat_indonesia": row["kalimat_indonesia"],
            "p_content": row["content"],
            "p_metadata": row["metadata"],
            "p_embedding": vector_literal(embedding),
        },
    )


def main():
    parser = argparse.ArgumentParser(
        description="Ingest Kamus Tolaki workbook into Supabase vector store via OpenRouter embeddings."
    )
    parser.add_argument("--xlsx", type=Path, default=DEFAULT_XLSX)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = {**load_env(ROOT / ".env.local")}
    openrouter_api_key = require_env(env, "OPENROUTER_API_KEY")
    supabase_url = require_env(env, "NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = env.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") or env.get(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    if not supabase_key:
        raise RuntimeError(
            "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )
    model = normalize_embedding_model(
        env.get("OPENROUTER_EMBEDDING_MODEL") or env.get("OPENAI_EMBEDDING_MODEL")
    )
    site_url = env.get("OPENROUTER_SITE_URL") or "http://localhost:3000"
    app_name = env.get("OPENROUTER_APP_NAME") or "Chatbot Tolaki"

    rows = read_dictionary_rows(args.xlsx, args.limit)
    print(f"Loaded {len(rows)} dictionary rows from {args.xlsx.name}")
    print(f"Embedding model: {model}")

    if args.dry_run:
        print(json.dumps(rows[:3], ensure_ascii=False, indent=2))
        return

    total = len(rows)
    inserted = 0
    for start in range(0, total, args.batch_size):
        batch = rows[start : start + args.batch_size]
        embeddings = embed_batch(
            [str(row["content"]) for row in batch],
            openrouter_api_key,
            model,
            site_url,
            app_name,
        )
        for row, embedding in zip(batch, embeddings):
            upsert_row(supabase_url, supabase_key, row, embedding)
            inserted += 1

        print(f"Upserted {inserted}/{total}")

    print(f"Done. Upserted {inserted} rows.")


if __name__ == "__main__":
    main()
