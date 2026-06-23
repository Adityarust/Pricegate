// Gate detail page — Step 10

export default function GateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">
        Gate <span className="text-accent-light">#{params.id}</span>
      </h1>
      <div className="glass-card p-8 text-center text-gray-500">
        Gate detail view — coming in Step 10
      </div>
    </div>
  );
}
