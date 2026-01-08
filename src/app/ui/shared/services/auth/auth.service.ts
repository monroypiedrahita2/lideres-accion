import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly auth: Auth, private readonly router: Router) { }

  createUserWithEmailAndPassword(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    ) as Promise<any>;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/public/login']);
    return signOut(this.auth);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  updatePassword(user: User, newPassword: string): Promise<void> {
    return updatePassword(user, newPassword);
  }

  getAuth() {
    return getAuth();
  }

  deleteUser() {
    return this.auth.currentUser?.delete();
  }

  isAuthenticated(): boolean {
    const user = this.auth.currentUser;
    return !!user;
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  getEmail(): string {
    return this.getAuth().currentUser?.email ?? '';
  }

  uidUser(): string {
    return this.getAuth().currentUser?.uid ?? '';
  }

  getPhotoUrl(): string | null {
    return this.getAuth().currentUser?.photoURL ?? null;
  }

  getFoto(): string | null {
    return this.getAuth().currentUser?.photoURL ?? null;
  }
}
