type PlaceholderPageProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <main className="page-shell">
      <section className="page-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
    </main>
  );
}
