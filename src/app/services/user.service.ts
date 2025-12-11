import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, forkJoin as rxForkJoin } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';

  // ✅ BehaviorSubject — holds global app state (ex: theme)
  appTheme$ = new BehaviorSubject<string>('light');

  // ✅ Subject — used for manual trigger events (like reload)
  reloadUsers$ = new Subject<void>();

  // ✅ Signal — reactive state (Angular 17+)
  selectedUser = signal<any | null>(null);

  constructor(private http: HttpClient) {}

  // --- Using map ---
  getUsers() {
    return this.http.get<any[]>(`${this.baseUrl}/users`).pipe(
      map((users) =>
        users.map((u) => ({
          id: u.id,
          name: u.name,
        }))
      )
    );
  }

  // --- Using mergeMap ---
  getUserPosts(userId: number) {
    return this.http
      .get(`${this.baseUrl}/users/${userId}`)
      .pipe(
        mergeMap((user: any) =>
          this.http
            .get(`${this.baseUrl}/posts?userId=${user.id}`)
            .pipe(map((posts: any) => ({ user, posts })))
        )
      );
  }

  // --- Using switchMap ---
  searchUserAndPosts(name: string) {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map((users: User[]) =>
        users.find((u) => u.name.toLowerCase().includes(name.toLowerCase()))
      ),
      switchMap((user: User | undefined) => {
        if (!user) {
          throw new Error('User not found');
        }
        return this.http.get<Post[]>(`${this.baseUrl}/posts?userId=${user.id}`);
      })
    );
  }
  // --- Using forkJoin ---
  getUserPostsAndTodos(userId: number) {
    return rxForkJoin({
      posts: this.http.get(`${this.baseUrl}/posts?userId=${userId}`),
      todos: this.http.get(`${this.baseUrl}/todos?userId=${userId}`),
    });
  }

  // --- Helper: Change theme ---
  toggleTheme() {
    const newTheme = this.appTheme$.value === 'light' ? 'dark' : 'light';
    this.appTheme$.next(newTheme);
  }
}
