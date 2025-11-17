import { useQueryClient } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { RouterProvider as ReactRouterProvider, createBrowserRouter } from 'react-router-dom'
import { useVocdoniApi } from '~contexts/vocdoni-api-context'
import { getProcessQuery } from '~hooks/use-process-query'
import ExplorePage from '~pages/Explore'
import AppError from './AppError'
import { Layout } from './Layout'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const VotePage = lazy(() => import('./pages/VotePage'))
const ImplementPage = lazy(() => import('./pages/ImplementPage'))
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'))
const ParticipatePage = lazy(() => import('./pages/ParticipatePage'))

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

export const RouterProvider = () => {
  const { api } = useVocdoniApi()
  const queryClient = useQueryClient()

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
          errorElement: <AppError />,
          loader: async ({ params }) => {
            if (!params.id) throw new Error('Vote ID is required')
            const id = params.id
            const query = getProcessQuery(id, api)

            const data = await queryClient.ensureQueryData(query)
            return { id, election: data }
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
        {
          path: 'explore',
          element: (
            <Suspense fallback={<Loading />}>
              <ExplorePage />
            </Suspense>
          ),
        },
        {
          path: '*',
          element: <AppError />,
        },
      ],
    },
  ])

  return <ReactRouterProvider router={router} />
}
