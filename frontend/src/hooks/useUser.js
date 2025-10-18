import { useQuery } from '@tanstack/react-query';
import API from '../services/api'; // make sure this is a default export, not named
import { userProfileService } from '../services/userProfile.service';

// Function to fetch user
export const fetchUser = async () => {
  try {
    // First get basic auth info
    const authResponse = await API.get('/auth/me');
    const basicUser = authResponse.data.user;
    
    // Then try to get profile data to supplement with profile picture and other fields
    try {
      const profileResponse = await userProfileService.getCurrentUserProfile();
      console.log('Profile response:', profileResponse);
      
      // Merge auth data with profile data, prioritizing profile data for overlapping fields
      const mergedUser = {
        ...basicUser,
        ...profileResponse, // Profile response contains the data directly, not nested under 'user'
        // Make sure we keep the id from auth response
        id: basicUser.id,
        // Create a computed name field from firstName and lastName
        name: profileResponse.firstName && profileResponse.lastName
          ? `${profileResponse.firstName} ${profileResponse.lastName}`.trim()
          : profileResponse.firstName || profileResponse.lastName || basicUser.name || basicUser.username
      };
      
      console.log('Merged user data:', mergedUser);
      return mergedUser;
    } catch (profileError) {
      console.log('Profile fetch failed, using basic auth data:', profileError);
      return basicUser;
    }
  } catch (error) {
    console.error('Auth fetch failed:', error);
    throw error;
  }
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
