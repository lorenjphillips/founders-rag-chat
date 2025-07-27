import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthService, type GoogleUser } from '@/lib/googleAuth';

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already signed in
    const currentUser = googleAuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const signIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch user info using the access token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const data = await response.json();
        
        const user: GoogleUser = {
          id: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture
        };
        
        googleAuthService.setCurrentUser(user);
        setUser(user);
        window.location.reload(); // Reload to update rate limits
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to fetch user information');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Login Failed');
    },
    scope: 'email profile'
  });

  const signOut = () => {
    googleAuthService.signOut();
    setUser(null);
    // Reload to reset rate limits
    window.location.reload();
  };

  return {
    user,
    isSignedIn: !!user,
    isLoading,
    error,
    signIn,
    signOut
  };
}