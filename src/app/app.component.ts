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
  // url: string = "https://localhost:7035/";
  url: string = "https://88.24.26.59/";
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
          this.token = value;
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
          this.token = null;
          alert('Logout successful');
        },
        error: (error) => {
          console.error('Logout error', error);
          alert('Logout error');
        }
      });
  }

  registerForm = new FormGroup({
    nick: new FormControl<string>(''),
    name: new FormControl<string>(''),
    surname1: new FormControl<string>(''),
    surname2: new FormControl<string | null>(null),
    bday: new FormControl<Date | string>(''),
    phoneNumber: new FormControl<string>(''),
    email: new FormControl<string>(''),
    pass: new FormControl<string>(''),
    pass2: new FormControl<string>(''),
    image: new FormControl<File | null>(null),
    about: new FormControl<string | null>(null),
    location: new FormControl<string | null>(null),
    publicProfile: new FormControl<string>('0')
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.registerForm.patchValue({ image: file });
      console.log('Selected file:', file.name, 'Size:', file.size);
    }
  }

  onRegisterFormSubmit() {
    if (this.registerForm.value.pass !== this.registerForm.value.pass2) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Crear un objeto FormData para enviar los datos junto con la imagen
  const formData = new FormData();
  // Add all form fields to FormData
    if (this.registerForm.value.nick) formData.append('Nick', this.registerForm.value.nick);
    if (this.registerForm.value.name) formData.append('Name', this.registerForm.value.name);
    if (this.registerForm.value.surname1) formData.append('Surname1', this.registerForm.value.surname1);
    if (this.registerForm.value.surname2) formData.append('Surname2', this.registerForm.value.surname2 || '');
    if (this.registerForm.value.bday) formData.append('Bday', this.registerForm.value.bday.toString());
    if (this.registerForm.value.phoneNumber) formData.append('PhoneNumber', this.registerForm.value.phoneNumber);
    if (this.registerForm.value.email) formData.append('Email', this.registerForm.value.email);
    if (this.registerForm.value.pass) formData.append('Password', this.registerForm.value.pass);
    if (this.registerForm.value.pass2) formData.append('Password2', this.registerForm.value.pass2);

    const imageFile = this.registerForm.get('image')?.value as File;
    if (imageFile) {
      formData.append('ProfileImageFile', imageFile, imageFile.name);
      console.log('Appending image:', imageFile.name);
    }
    if (this.registerForm.value.about) formData.append('About', this.registerForm.value.about);
    if (this.registerForm.value.location) formData.append('UserLocation', this.registerForm.value.location);
    if (this.registerForm.value.publicProfile) formData.append('PublicProfile', this.registerForm.value.publicProfile ? '1' : '0');

    if (this.selectedUserId) {
      // Actualizar usuario existente
      this.http.patch(`${this.url}api/Account/Update/${this.selectedUserId}`, formData, { responseType: 'text' })
        .subscribe({
          next: (value) => {
            alert('Usuario actualizado con éxito.');
            this.contacts$ = this.getContacts(); // Refresca la lista de contactos.
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

onDelete() {
  const confirmDelete = confirm('¿Estás Seguro que Deseas Eliminar tu Cuenta?');
  if (confirmDelete && this.token) {
    this.http.delete(`${this.url}api/Account/Delete`, {
      headers: { Authorization: `Bearer ${this.token}` },
      responseType: 'text'
    }).subscribe({
      next: (value) => {
        console.log('User Deleted Successfully', value);
        alert('Cuenta Eliminada con Éxito');
        this.token = null;
        this.contacts$ = this.getContacts(); // Refresca la lista de contactos.
        // Aquí puedes limpiar el estado de la app, cerrar sesión, etc.
      },
      error: (error) => {
        console.error('Error Deleting User', error);
        alert('Error al Eliminar la Cuenta');
      }
    });
  }
}

  onUpdate(nick: string) {
    // Busca los datos del usuario seleccionado
    this.http.get<any>(`${this.url}api/Account/GetUserInfo/${nick}`,
        {
            headers: { Authorization: `Bearer ${this.token}` }
        }
    )
      .subscribe({
        next: (user) => {
          console.log('User data loaded for update', user);
          this.selectedUserId = nick; // Guarda el ID del usuario seleccionado
          // Rellena el formulario con los datos del usuario
          this.registerForm.patchValue({
            nick: user.nick,
            name: user.name,
            surname1: user.surname1,
            surname2: user.surname2,
            bday: user.bday,
            phoneNumber: user.phoneNumber,
            email: user.email,
            pass: '', // No se debe rellenar la contraseña por seguridad
            pass2: '',
            image: null, // Maneja la imagen según sea necesario
            about: user.about,
            location: user.userLocation,
            publicProfile: user.publicProfile
          });
        },
        error: (error) => {
          console.error('Error loading user data', error);
          alert('Error al cargar los datos del usuario');
        }
      });
  }

  private getContacts(): Observable<any> {
    if (this.token) {
      return this.http.get(this.url + 'api/Account/Users', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
    } else {
      return this.http.get(this.url + 'api/Account/Users');
    }
  }
}
