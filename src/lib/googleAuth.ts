export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

class GoogleAuthService {
  getCurrentUser(): GoogleUser | null {
    const userData = localStorage.getItem('google_user');
    return userData ? JSON.parse(userData) : null;
  }

  setCurrentUser(user: GoogleUser): void {
    localStorage.setItem('google_user', JSON.stringify(user));
  }

  signOut(): void {
    // Clear user from localStorage
    localStorage.removeItem('google_user');
    // Clear auth-specific rate limit data
    localStorage.removeItem('founders_rag_rate_limit_auth');
  }

  isSignedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const googleAuthService = new GoogleAuthService();