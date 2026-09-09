type Props = { params: Promise<{ id: string }> };

export default async function SessionPage({ params }: Props) {
  const { id } = await params;
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Session {id}</h1>
      <p>Chat + tool timeline placeholder.</p>
    </main>
  );
}
