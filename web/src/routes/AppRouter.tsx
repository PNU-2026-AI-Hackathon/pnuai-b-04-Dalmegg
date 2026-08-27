import { lazy, Suspense, type ReactNode } from 'react'
import {
  createBrowserRouter,
  useLocation,
  Navigate,
  RouterProvider,
} from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SignupPage } from '../pages/SignupPage'
import { useAuthStore } from '../store/useAuthStore'

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

const CollectionRequestsPage = lazy(() =>
  import('../pages/CollectionRequestsPage').then((module) => ({
    default: module.CollectionRequestsPage,
  })),
)

const OrdersPage = lazy(() =>
  import('../pages/OrdersPage').then((module) => ({
    default: module.OrdersPage,
  })),
)

function RouteLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div
        className="size-8 animate-spin rounded-full border-4 border-rose-100 border-t-rose-600"
        aria-label="페이지 불러오는 중"
      />
    </div>
  )
}

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{page}</Suspense>
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const operator = useAuthStore((state) => state.operator)

  if (!operator) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return children
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
        path: ROUTES.login,
        element: <LoginPage />,
      },
      {
        path: ROUTES.signup,
        element: <SignupPage />,
      },
      {
        path: ROUTES.notFound,
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
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
        path: ROUTES.collections,
        element: lazyPage(<CollectionRequestsPage />),
      },
      {
        path: ROUTES.orders,
        element: lazyPage(<OrdersPage />),
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
