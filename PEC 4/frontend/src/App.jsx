import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ExoplanetsPage from "@/pages/ExoplanetsPage";

const ExoplanetDetailPage = lazy(() => import("@/pages/ExoplanetDetailPage"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<ExoplanetsPage />} />
      <Route
        path="/exoplanetas/:id"
        element={
          <Suspense
            fallback={
              <div className="mx-auto max-w-2xl px-6 py-12 pb-24">
                <div className="frame border border-border px-6 py-16 text-center">
                  <p className="font-serif text-base text-ink">Cargando exoplaneta…</p>
                </div>
              </div>
            }
          >
            <ExoplanetDetailPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
