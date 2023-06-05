import { Component, Inject } from '@angular/core';
import { User } from './model/user';
import { TestService } from './service/test.service';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ang-basic-practice003-comp-pipe';

  userList: User[] = this.userService.list;

  constructor(
    private userService: UserService,
  ) {}

  /**
   * FELADAT!
   * Az app-user-list delUser eseményére lefutó metódus.
   * Neve: onDeleteUser
   * Működése:
   * 1. A this.userService.removeUser metódust meghívja a kapott user-rel.
   * @param user {User} - egy felhasználó
   * @returns {void}
   */


}
