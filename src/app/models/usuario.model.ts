export class UsuarioModel {

  static fromFirebase({email, uid, nombre}) {
    return new UsuarioModel(uid, nombre, email)
  }

  constructor(
    public uid: string,
    public nombre: string,
    public email: string,
  ) {
  }
}
