import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(username: string, password: string): Promise<boolean> {
    console.log('Attempting to log in with:', username, password);
    return Promise.resolve(true); // Dummy login
  }

  register(username: string, password: string): Promise<boolean> {
    console.log('Attempting to register with:', username, password);
    return Promise.resolve(true); // Dummy registration
  }

  isLoggedIn(): Promise<boolean> {
    return Promise.resolve(true); // Dummy check
  }
}
