import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '../services/api';
import { Tenant } from '../types';

export function useTenant() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tenant, isLoading, error } = useQuery<Tenant>({
    queryKey: ['tenant', slug],
    queryFn: () => tenantApi.get(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  return { tenant, slug, isLoading, error };
}
