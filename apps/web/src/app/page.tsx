export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-primary-600">MultiEnlace</h1>
        <p className="text-xl text-gray-600">
          Tu página de enlaces personalizada con analíticas avanzadas
        </p>
        <div className="flex gap-4">
          <button className="rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700">
            Empezar gratis
          </button>
          <button className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50">
            Saber más
          </button>
        </div>
      </main>
    </div>
  );
}
