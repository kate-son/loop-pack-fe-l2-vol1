import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/api/getQueryClient';
import { homeQueryOptions } from './model/homeQueryOptions';
import { HomeView } from './ui/HomeView';

export default async function HomePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(homeQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
