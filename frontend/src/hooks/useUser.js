import { useQuery } from '@tanstack/react-query';
import API from '../services/api'; // make sure this is a default export, not named

// Function to fetch user
export const fetchUser = async () => {
  const response = await API.get('/api/auth/me');
  return response.data.user;
};

// Hook to use user
export const useUser = () => {
  const {
    data: user, // alias data as user
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;
