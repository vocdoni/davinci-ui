import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
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

const VoteResultsLoading = () => (
  <div className='px-4'>
    <div className='max-w-7xl mx-auto'>
      <div className='text-center py-16'>
        <div className='w-8 h-8 border-2 border-davinci-black-alt/30 border-t-davinci-black-alt rounded-full animate-spin mx-auto mb-4' />
        <h1 className='text-2xl font-bold text-davinci-black-alt'>Loading vote results...</h1>
        <p className='text-davinci-black-alt/80 mt-2'>Preparing the completed vote demonstration</p>
      </div>
    </div>
  </div>
)

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const VotePage = lazy(() => import('./pages/VotePage'))
const ExplorerPage = lazy(() => import('./pages/ExplorerPage'))
const ImplementPage = lazy(() => import('./pages/ImplementPage'))
const NewsletterPage = lazy(() => import('./pages/NewsletterPage'))
const ParticipatePage = lazy(() => import('./pages/ParticipatePage'))
const PublicVoteSampleEndPage = lazy(() => import('./pages/PublicVoteSampleEndPage'))

export const router = createBrowserRouter([
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
      },
      {
        path: 'explorer',
        element: (
          <Suspense fallback={<Loading />}>
            <ExplorerPage />
          </Suspense>
        ),
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
        path: 'public-vote-sample-end',
        element: (
          <Suspense fallback={<VoteResultsLoading />}>
            <PublicVoteSampleEndPage />
          </Suspense>
        ),
      },
    ],
  },
])
