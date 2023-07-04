import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {map, Subscription} from "rxjs";
import {UsuarioModel} from "../models/usuario.model";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Store} from "@ngrx/store";
import {AppState} from "../app.reducer";
import {setUser, unSetUser} from "../auth/auth.actions";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userSubscription: Subscription;
  private _user: UsuarioModel

  get user() {
    return this._user;
  }

  constructor(public auth: AngularFireAuth,
              private firestore: AngularFirestore,
              private store: Store<AppState>) {
  }

  initAuthListener() {
    this.auth.authState.subscribe(fuser => {
      if (fuser) {
        this.userSubscription = this.firestore.doc(`${fuser.uid}/usuario`).valueChanges()
          .subscribe((firestore: any) => {
            const user = UsuarioModel.fromFirebase(firestore);
            this._user = user;
            this.store.dispatch(setUser({user}))
          })
      } else {
        this._user = null;
        if (this.userSubscription) {
          this.userSubscription.unsubscribe();
        }
        this.store.dispatch(unSetUser());
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password)
      .then(({user}) => {
        const newUser = new UsuarioModel(user.uid, nombre, user.email);
        return this.firestore.doc(`${user.uid}/usuario`).set({...newUser})
      });
  }


  loginUsuario(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(
      map(fbUser => fbUser != null)
    );
  }

}
