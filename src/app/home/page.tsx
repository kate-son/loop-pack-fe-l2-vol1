import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/api/getQueryClient';
import { useHomeData } from './model/useHomeData';
import { HomeView } from './ui/HomeView';

export default async function HomePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(useHomeData.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
