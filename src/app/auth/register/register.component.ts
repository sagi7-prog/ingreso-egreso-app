import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import Swal from "sweetalert2";
import {Store} from "@ngrx/store";
import {AppState} from "../../app.reducer";
import {Subscription} from "rxjs";
import {isLoading, stopLoading} from "../../shared/ui.actions";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: []
})
export class RegisterComponent implements OnInit, OnDestroy {

  registroForm: FormGroup;
  cargando: boolean = false;
  uiSubscription: Subscription

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private store: Store<AppState>,
              private router: Router) {
  }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.uiSubscription = this.store.select('ui')
      .subscribe(ui => {
        this.cargando = ui.isLoading;
        console.log('cargando subs');
      });
  }

  ngOnDestroy(): void {
    this.uiSubscription.unsubscribe();
  }

  crearUsuario() {

    if (this.registroForm.invalid) {
      return
    }

    this.store.dispatch(isLoading());

    // Swal.fire({
    //   title: 'Espere por favor...',
    //   didOpen: () => {
    //     Swal.showLoading(null);
    //   }
    // });

    const {nombre, correo, password} = this.registroForm.value;

    this.authService.crearUsuario(nombre, correo, password)
      .then(credenciales => {
        // Swal.close();
        this.store.dispatch(stopLoading());
        this.router.navigate(['/']);
      })
      .catch(err => {
        this.store.dispatch(stopLoading());
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message,
        })
      });
  }

}
