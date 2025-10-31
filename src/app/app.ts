import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Header } from './components/header/header.component';
import { Navbar } from './components/navbar/navbar.component';
import { Footer } from './components/footer/footer.component';
import { filter, map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Sasta Chasma');
  private destroy$ = new Subject<void>();

  constructor(private titleService: Title, private metaService: Meta, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child && child.firstChild) {
          child = child.firstChild;
        }
        if (child && child.snapshot.data['title']) {
          return { title: child.snapshot.data['title'], description: child.snapshot.data['description'] };
        }
        return { title: 'Sasta Chasma', description: 'Your one-stop shop for affordable and stylish eyeglasses and lenses.' }; // Default title and description
      })
    ).subscribe((data: { title: string, description: string }) => {
      this.titleService.setTitle(data.title);
      this.title.set(data.title); // Update the signal as well
      this.metaService.updateTag({ name: 'description', content: data.description });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
