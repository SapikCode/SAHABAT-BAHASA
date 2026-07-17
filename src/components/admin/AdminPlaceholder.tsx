type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <section className="rounded-[28px] border border-[#efe6d7] bg-white p-5 shadow-sm md:p-6">
      <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#de990e]">
        Segera
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#141414]">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6659]">
        {description}
      </p>
    </section>
  );
}

