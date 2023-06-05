import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailComponent } from './user-detail.component';

import { mockUsers } from '../mocks/mockUsers';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('UserDetailComponent should be created', () => {
    expect(component).toBeTruthy();
  });

  it('user should exist', () => {
    expect(component.user).toBeTruthy();
  });

  it('onDelete should exist', () => {
    expect(component.onDelete).toBeTruthy();
  });

  it('id should be appeared', async () => {
    component.user = mockUsers[2];
    fixture.detectChanges();

    let idElement: HTMLParagraphElement = fixture.debugElement.nativeElement
      .querySelector(
        '.card-body p:first-child'
      );

    fixture.whenStable().then(() => {
      expect(idElement.textContent).toMatch(/3/);
    });
  });

  it('onDelete should be called', async () => {
    spyOn(component, 'onDelete');

    component.user = mockUsers[2];
    fixture.detectChanges();

    let delButton = fixture.debugElement.nativeElement.querySelector(
      '.card.user-card .card-body button'
    );
    delButton.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.onDelete).toHaveBeenCalled();
    });
  });


});
