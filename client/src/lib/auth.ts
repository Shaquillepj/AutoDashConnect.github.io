import { User } from "@shared/schema";

let currentUser: User | null = null;

export const auth = {
  getCurrentUser(): User | null {
    return currentUser;
  },

  setCurrentUser(user: User | null): void {
    currentUser = user;
  },

  isAuthenticated(): boolean {
    return currentUser !== null;
  },

  isCustomer(): boolean {
    return currentUser?.role === 'customer';
  },

  isProvider(): boolean {
    return currentUser?.role === 'provider';
  },

  logout(): void {
    currentUser = null;
  }
};
