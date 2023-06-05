import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../model/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  /**
   * FELADAT!
   * Hozd létre az alábbi Input tulajdonságot.
   * @var users {User[]} - Input tulajdonság
   * @default []
   */
  
  @Output() delUser: EventEmitter<User> = new EventEmitter();
  currentUser: User = new User();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * FELADAT!
   * Az eye gombra kattintás esetén lefutó metódus.
   * Neve: onSelectUser
   * Működése: a this.currentUser értékét beállítja a kapott változóra.
   * @param user {User} - egy felhasználó
   * @returns {void}
   */
  

  /**
   * FELADAT!
   * Az app-user-detail delUser eseményére lefutó metódus.
   * Neve: onDeleteUser
   * Működése:
   * 1. A this.delUser.emit metódust meghívja a kapott user-rel.
   * 2. A this.currentUser értékeként egy új User-t ad meg.
   * @param user {User} - egy felhasználó
   * @returns {void}
   */
  

}
