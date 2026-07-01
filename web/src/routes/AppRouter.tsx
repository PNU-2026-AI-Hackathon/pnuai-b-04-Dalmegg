import { lazy, Suspense, type ReactNode } from 'react'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { LandingPage } from '../pages/LandingPage'
import { NotFoundPage } from '../pages/NotFoundPage'

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
)

const SensorMonitoringPage = lazy(() =>
  import('../pages/SensorMonitoringPage').then((module) => ({
    default: module.SensorMonitoringPage,
  })),
)

const InventoryPage = lazy(() =>
  import('../pages/InventoryPage').then((module) => ({
    default: module.InventoryPage,
  })),
)

const ReservationsPage = lazy(() =>
  import('../pages/ReservationsPage').then((module) => ({
    default: module.ReservationsPage,
  })),
)

const CollectionsPage = lazy(() =>
  import('../pages/CollectionsPage').then((module) => ({
    default: module.CollectionsPage,
  })),
)

const SimulatorPage = lazy(() =>
  import('../pages/SimulatorPage').then((module) => ({
    default: module.SimulatorPage,
  })),
)

function RouteLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div
        className="size-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600"
        aria-label="페이지 불러오는 중"
      />
    </div>
  )
}

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{page}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: ROUTES.home,
        element: <LandingPage />,
      },
      {
        path: ROUTES.simulator,
        element: lazyPage(<SimulatorPage />),
      },
      {
        path: ROUTES.notFound,
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: ROUTES.dashboard,
        element: lazyPage(<DashboardPage />),
      },
      {
        path: ROUTES.sensors,
        element: lazyPage(<SensorMonitoringPage />),
      },
      {
        path: ROUTES.flowers,
        element: lazyPage(<InventoryPage />),
      },
      {
        path: ROUTES.reservations,
        element: lazyPage(<ReservationsPage />),
      },
      {
        path: ROUTES.eggShell,
        element: lazyPage(<CollectionsPage />),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.notFound} replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
