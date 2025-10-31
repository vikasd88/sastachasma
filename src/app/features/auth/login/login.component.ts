import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  username!: string;
  password!: string;
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

  login(): void {
    this.errorMessage = undefined; // Clear previous errors
    this.authService.login(this.username, this.password).then(success => {
      if (success) {
        this.router.navigate(['/']); // Redirect to home on successful login
      } else {
        this.errorMessage = 'Invalid username or password.';
      }
    }).catch(error => {
      this.errorMessage = 'An error occurred during login.';
      console.error('Login error:', error);
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
