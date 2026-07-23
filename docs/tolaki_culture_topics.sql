create table if not exists public.tolaki_culture_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Adat Istiadat',
  summary text not null default '',
  hero_image_url text,
  sections jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tolaki_culture_topics_sections_array
    check (jsonb_typeof(sections) = 'array')
);

create index if not exists tolaki_culture_topics_category_idx
  on public.tolaki_culture_topics (category);

create index if not exists tolaki_culture_topics_published_idx
  on public.tolaki_culture_topics (is_published);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tolaki_culture_topics_updated_at
  on public.tolaki_culture_topics;

create trigger set_tolaki_culture_topics_updated_at
before update on public.tolaki_culture_topics
for each row
execute function public.set_updated_at();

alter table public.tolaki_culture_topics enable row level security;

drop policy if exists "Public can read published Tolaki cultures"
  on public.tolaki_culture_topics;

create policy "Public can read published Tolaki cultures"
on public.tolaki_culture_topics
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage Tolaki cultures"
  on public.tolaki_culture_topics;

create policy "Admins can manage Tolaki cultures"
on public.tolaki_culture_topics
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

insert into public.tolaki_culture_topics (
  slug,
  title,
  category,
  summary,
  sections,
  is_published
)
values
  (
    'pernikahan-adat-tolaki',
    'Pernikahan Adat Tolaki',
    'Adat Istiadat',
    'Gambaran awal tentang prosesi pernikahan adat Tolaki, nilai keluarga, busana, dan makna musyawarah dalam penyatuan dua keluarga.',
    '[
      {
        "title": "Cerita sejarah",
        "body": "Pernikahan dalam budaya Tolaki tidak hanya dipahami sebagai ikatan dua orang, tetapi juga pertemuan dua keluarga besar. Prosesi adat menekankan penghormatan, komunikasi keluarga, dan kesepakatan bersama."
      },
      {
        "title": "Baju adat",
        "body": "Busana adat digunakan sebagai simbol kehormatan dan identitas. Warna, aksesori, serta kerapian pakaian menunjukkan penghargaan terhadap keluarga dan tamu adat."
      },
      {
        "title": "Makna budaya",
        "body": "Nilai utama yang ditonjolkan adalah sopan santun, tanggung jawab, dan persatuan. Dalam banyak prosesi, keluarga menjadi pusat pengambilan keputusan."
      }
    ]'::jsonb,
    true
  ),
  (
    'makanan-tradisional-sinonggi',
    'Makanan Tradisional Sinonggi',
    'Makanan Tradisional',
    'Pengenalan sinonggi sebagai makanan tradisional yang dekat dengan kehidupan masyarakat Tolaki dan sering hadir dalam suasana kebersamaan.',
    '[
      {
        "title": "Cerita sejarah",
        "body": "Sinonggi dikenal sebagai makanan berbahan dasar sagu yang tumbuh dalam kebiasaan makan masyarakat setempat. Hidangan ini lekat dengan alam dan ketersediaan bahan pangan lokal."
      },
      {
        "title": "Cara penyajian",
        "body": "Sinonggi biasanya disajikan bersama kuah ikan, sayur, atau lauk lain. Cara menyantapnya sering menjadi pengalaman budaya tersendiri bagi orang yang baru mengenalnya."
      },
      {
        "title": "Makna kebersamaan",
        "body": "Makanan tradisional seperti sinonggi kerap hadir dalam momen keluarga dan pertemuan sosial. Ia menjadi penanda kedekatan, keramahan, dan identitas lokal."
      }
    ]'::jsonb,
    true
  ),
  (
    'kalosara',
    'Kalosara',
    'Nilai Budaya',
    'Kalosara dikenal sebagai simbol adat yang memuat nilai perdamaian, persatuan, penghormatan, dan penyelesaian masalah secara bermartabat.',
    '[
      {
        "title": "Cerita singkat",
        "body": "Kalosara memiliki posisi penting dalam adat Tolaki. Simbol ini sering dihubungkan dengan tata nilai yang mengatur hubungan sosial masyarakat."
      },
      {
        "title": "Fungsi sosial",
        "body": "Dalam konteks adat, Kalosara dapat menjadi penanda musyawarah, perdamaian, dan penghormatan terhadap keputusan bersama."
      },
      {
        "title": "Makna",
        "body": "Nilai yang melekat pada Kalosara menekankan persatuan, kehormatan, dan keseimbangan dalam kehidupan bermasyarakat."
      }
    ]'::jsonb,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  sections = excluded.sections,
  is_published = excluded.is_published;
