import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../model/user';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {

  /**
   * FELADAT!
   * Hozd létre az alábbi Input tulajdonságot.
   * @var user {User} - Input tulajdonság
   * @default új User
   */


  @Output() delUser: EventEmitter<User> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * FELADAT!
   * A törlés gombra kattintás esetén lefutó metódus.
   * Neve: onDelete
   * Működése: a this.delUser.emit metódust meghívja a kapott user-rel.
   * @param user {User} - az aktuális felhasználó
   * @returns {void}
   */


}
