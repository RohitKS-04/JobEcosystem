type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
    </section>
  );
}
