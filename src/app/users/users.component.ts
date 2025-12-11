import { Component, OnInit, computed, effect } from '@angular/core';
import { UserService } from '../services/user.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  selectedUserPosts: any[] = [];
  todos: any[] = [];
  name = '';
  posts: any[] = [];

  // for cleanup
  private destroy$ = new Subject<void>();

  // ✅ Computed signal (depends on selectedUser signal)
  userName = computed(() => {
    const user = this.userService.selectedUser();
    return user ? user.name : 'No user selected';
  });

  // ✅ Reactive theme state
  currentTheme = '';

  constructor(public userService: UserService) {
    // 🔄 Watch theme changes using BehaviorSubject
    this.userService.appTheme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    // 👀 Watch signal changes with effect
    effect(() => {
      const user = this.userService.selectedUser();
      if (user) console.log('🟢 Selected user changed:', user.name);
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // 🔁 Listen for reload triggers from Subject
    this.userService.reloadUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers());
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  viewDetails(userId: number) {
    this.userService.getUserPostsAndTodos(userId).subscribe((result: any) => {
      // ✅ Update signal
      const selected = this.users.find((u) => u.id === userId);
      this.userService.selectedUser.set(selected);

      this.selectedUserPosts = result.posts;
      this.todos = result.todos;
    });
  }

  reload() {
    // ✅ Trigger reload manually via Subject
    this.userService.reloadUsers$.next();
  }

  toggleTheme() {
    this.userService.toggleTheme();
  }
  search() {
    if (!this.name.trim()) {
      this.posts = [];
      return;
    }
    this.userService.searchUserAndPosts(this.name).subscribe({
      next: (posts) => (this.posts = posts),
      error: (err) => {
        console.error(err);
        this.posts = [];
      },
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
