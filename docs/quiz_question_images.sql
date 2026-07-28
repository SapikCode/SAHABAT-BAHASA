alter table public.quiz_questions
  add column if not exists image_url text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'quiz-images',
  'quiz-images',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'quiz_images_public_read'
  ) then
    create policy quiz_images_public_read
      on storage.objects
      for select
      to public
      using (bucket_id = 'quiz-images');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'quiz_images_admin_insert'
  ) then
    create policy quiz_images_admin_insert
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'quiz-images' and public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'quiz_images_admin_update'
  ) then
    create policy quiz_images_admin_update
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'quiz-images' and public.is_admin(auth.uid()))
      with check (bucket_id = 'quiz-images' and public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'quiz_images_admin_delete'
  ) then
    create policy quiz_images_admin_delete
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'quiz-images' and public.is_admin(auth.uid()));
  end if;
end $$;
