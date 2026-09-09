type Props = { params: Promise<{ id: string }> };

export default async function ApprovalPage({ params }: Props) {
  const { id } = await params;
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Approval {id}</h1>
      <p>Approve / reject / modify placeholder (Phase 7).</p>
    </main>
  );
}
