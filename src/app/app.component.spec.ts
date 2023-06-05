import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UserService } from './service/user.service';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserListComponent } from './user-list/user-list.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        UserListComponent,
        UserDetailComponent,
      ],
      providers: [
        UserService,
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('user should be deleted', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector(
      'table tbody tr:nth-child(5) button'
    );
    button.click();
    fixture.detectChanges();

    const delButton = fixture.debugElement.nativeElement.querySelector(
      '.card.user-card .card-body button'
    );
    delButton.click();
    fixture.detectChanges();

    const idField: HTMLElement = fixture.debugElement.nativeElement.querySelector(
      'table tbody tr:nth-child(5) td:nth-child(1)'
    );

    fixture.whenStable().then(() => {
      expect(idField.textContent).not.toMatch(/5/)
    });
  });
});
