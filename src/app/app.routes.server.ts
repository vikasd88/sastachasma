import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'frames/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // In a real application, you would fetch available frame IDs from a database or API.
      // For this example, we'll provide some placeholder IDs.
      return [{ id: '1' }, { id: '2' }, { id: '3' }];
    },
  },
  {
    path: 'lenses/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      // Similarly, fetch lens IDs from your data source.
      // For this example, we'll provide some placeholder IDs.
      return [{ id: '1' }, { id: '2' }, { id: '3' }];
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
