import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NexusAstralis';
  url: string = "https://localhost:7035/";
  // url: string = "https://88.25.64.124/";
  input: any = HTMLInputElement;
  file: any = null;
  http = inject(HttpClient);
  contacts$ = this.getContacts();
  selectedUserId: string | null = null;
  token: string | null = null;

  loginFrom = new FormGroup({
    email: new FormControl<string>(''),
    pass: new FormControl<string>('')
  });

  onLoginFormSubmit() {
    const loginData = {
      Email: this.loginFrom.value.email,
      Password: this.loginFrom.value.pass
    };
    this.http.post(this.url + 'api/Account/Login', loginData, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('Login successful, Token: ', value);
          alert('Login successful');
        },
        error: (error) => {
          console.error('Login error', error);
          alert('Login Error: ' + error);
        }
      });
  }
  onLogout() {
    this.http.post(this.url + 'api/Account/Logout', {}, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('Logout successful', value);
          alert('Logout successful');
        },
        error: (error) => {
          console.error('Logout error', error);
          alert('Logout error');
        }
      });
  }

  registerForm = new FormGroup({
    name: new FormControl<string>(''),
    surname1: new FormControl<string>(''),
    surname2: new FormControl<string | null>(null),
    bday: new FormControl<Date | string>(''),
    phoneNumber: new FormControl<string>(''),
    email: new FormControl<string>(''),
    pass: new FormControl<string>(''),
    pass2: new FormControl<string>(''),
    image: new FormControl<File | null>(null)
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.registerForm.patchValue({ image: file });
      this.registerForm.get('image')?.updateValueAndValidity(); // Asegúrate de que el valor sea válido.
      console.log('Archivo seleccionado:', file); // Agrega un log para verificar el archivo
    }
  }

  onRegisterFormSubmit() {
    const userData = {
      Name: this.registerForm.value.name,
      Surname1: this.registerForm.value.surname1,
      Surname2: this.registerForm.value.surname2,
      Bday: this.registerForm.value.bday,
      PhoneNumber: this.registerForm.value.phoneNumber,
      Email: this.registerForm.value.email,
      Password: this.registerForm.value.pass,
      Password2: this.registerForm.value.pass2
    };

    if (userData.Password !== userData.Password2) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Crear un objeto FormData para enviar los datos junto con la imagen
  const formData = new FormData();
  formData.append('Name', userData.Name || '');
  formData.append('Surname1', userData.Surname1 || '');
  formData.append('Surname2', userData.Surname2 || '');
  formData.append('Bday', userData.Bday ? userData.Bday.toString() : '');
  formData.append('PhoneNumber', userData.PhoneNumber || '');
  formData.append('Email', userData.Email || '');
  formData.append('Password', userData.Password || '');
  formData.append('Password2', userData.Password2 || '');
  // formData.append('ProfileImageFile', this.file);

  // Agregar la imagen al FormData si existe
  const imageInput = this.registerForm.value.image as File | null;
  if (imageInput) {
    formData.append('ProfileImageFile', imageInput);
    console.log('Imagen agregada al FormData:', imageInput);
  }

    if (this.selectedUserId) {
      // Actualizar usuario existente
      this.http.patch(`${this.url}api/Account/Update/${this.selectedUserId}`, formData, { responseType: 'text' })
      //this.http.patch(this.url + 'api/Account/Update/' + this.selectedUserId, userData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            alert('Usuario actualizado con éxito.');
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos
            this.registerForm.reset(); // Resetea el formulario
            this.selectedUserId = null; // Limpia el ID seleccionado
          },
          error: (error) => {
            alert('Error al actualizar el usuario.');
          }
        });
    } else {
      // Crear nuevo usuario
      this.http.post(this.url + 'api/Account/Register', formData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            console.log('User added successfully', value);
            alert('Usuario agregado con éxito: ' + value);
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos
            this.registerForm.reset(); // Resetea el formulario
          },
          error: (error) => {
            console.error('Error adding user', error);
            alert('Error al agregar el usuario');
          }
        });
    }
  }

  onDelete(id: string) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este usuario?');
    if (confirmDelete) {
      this.http.delete(`${this.url}api/Account/Delete/${id}`, { responseType: 'text' })
      .subscribe({
        next: (value) => {
          console.log('User deleted successfully', value);
          alert('User deleted successfully');
          this.contacts$ = this.getContacts(); // Refresh the contacts list after deletion.
        },
        error: (error) => {
          console.error('Error deleting user', error);
          alert('Error deleting user');
        }
      });
    }
  }

  onUpdate(id: string) {
    // Busca los datos del usuario seleccionado
    this.http.get<any>(`${this.url}api/Account/GetUser/${id}`)
      .subscribe({
        next: (user) => {
          console.log('User data loaded for update', user);
          this.selectedUserId = id; // Guarda el ID del usuario seleccionado
          // Rellena el formulario con los datos del usuario
          this.registerForm.patchValue({
            name: user.name,
            surname1: user.surname1,
            surname2: user.surname2,
            bday: user.bday,
            phoneNumber: user.phoneNumber,
            email: user.email,
            pass: '', // No se debe rellenar la contraseña por seguridad
            pass2: '',
            image: null // Maneja la imagen según sea necesario
          });
        },
        error: (error) => {
          console.error('Error loading user data', error);
          alert('Error al cargar los datos del usuario');
        }
      });
  }

  onRegister()
  {
    window.location.href = 'Register.html';
  }

  private getContacts(): Observable<any> {
    return this.http.get(this.url + 'api/Account/Users');
  }
}
