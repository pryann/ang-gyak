export class User {
  id: number = 0;
  name: string = '';
  email: string = '';
  address: string = '';
  active: boolean = true;

  constructor(properties?: User) {
    if (properties) {
      this.id = properties.id || 0;
      this.name = properties.name || '';
      this.email = properties.email || '';
      this.address = properties.address || '';
      this.active = properties.active || true;
    }
  }
}
