import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  username!: string;
  password!: string;
  confirmPassword!: string;
  errorMessage: string | undefined;

  constructor(
    @Inject(AuthService) private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to home
    this.authService.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.router.navigate(['/']);
      }
    });
  }

  register(): void {
    this.errorMessage = undefined; // Clear previous errors

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.register(this.username, this.password).then(success => {
      if (success) {
        this.router.navigate(['/login']); // Redirect to login on successful registration
      } else {
        this.errorMessage = 'Registration failed. Username might already be taken.';
      }
    }).catch(error => {
      this.errorMessage = 'An error occurred during registration.';
      console.error('Registration error:', error);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
