import type { ElectionMetadata } from '@vocdoni/davinci-sdk'
import { Suspense, lazy } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { up } from 'up-fetch'
import { useVocdoniApi } from '~components/vocdoni-api-context'
import { Layout } from './Layout'

// Loading components
const Loading = () => (
  <div className='px-4'>
    <div className='max-w-7xl mx-auto'>
      <div className='text-center py-16'>
        <div className='w-8 h-8 border-2 border-davinci-black-alt/30 border-t-davinci-black-alt rounded-full animate-spin mx-auto mb-4' />
        <h1 className='text-2xl font-bold text-davinci-black-alt'>Loading...</h1>
      </div>
    </div>
  </div>
)

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const VotePage = lazy(() => import('./pages/VotePage'))
const ImplementPage = lazy(() => import('./pages/ImplementPage'))
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'))
const ParticipatePage = lazy(() => import('./pages/ParticipatePage'))

const upfetch = up(fetch)

const Provider = () => {
  const api = useVocdoniApi()

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loading />}>
              <HomePage />
            </Suspense>
          ),
        },
        {
          path: 'vote/:id',
          element: (
            <Suspense fallback={<Loading />}>
              <VotePage />
            </Suspense>
          ),
          loader: async ({ params }) => {
            if (!params.id) {
              throw new Error('Vote ID is required')
            }
            const process = await api.getProcess(params.id)
            if (!process) {
              throw new Error('Vote not found')
            }
            const meta = await upfetch<ElectionMetadata>(process.metadataURI)
            return { id: params.id, process, meta }
          },
        },
        {
          path: 'implement',
          element: (
            <Suspense fallback={<Loading />}>
              <ImplementPage />
            </Suspense>
          ),
        },
        {
          path: 'newsletter',
          element: (
            <Suspense fallback={<Loading />}>
              <NewsletterPage />
            </Suspense>
          ),
        },
        {
          path: 'participate',
          element: (
            <Suspense fallback={<Loading />}>
              <ParticipatePage />
            </Suspense>
          ),
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

export { Provider as RouterProvider }
