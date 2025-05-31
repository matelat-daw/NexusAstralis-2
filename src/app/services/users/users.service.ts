import { Injectable, signal } from '@angular/core';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly API_URL = 'https://88.24.26.59/api/';
  private readonly Comment = 'Comment';
  private readonly Favorite = 'Account/Favorite/';

  token = signal<string | null>(sessionStorage.getItem('auth_token'));

  constructor() { }

  async getAll(): Promise<User[]> {
    const endPoint = "Account/GetUsers";
    const data = await fetch(`${this.API_URL}${endPoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching users: ${data.status}`);
    return data.json();
  }

  async getInfoByNick(nick: string): Promise<User> {
    const endPoint = "Account/GetUserInfo/";
    const data = await fetch(`${this.API_URL}${endPoint}${nick}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching user info: ${data.status}`);
    return data.json();
  }

  async getMyProfile(): Promise<User> {
    const endPoint = "Account/Profile";
    const data = await fetch(`${this.API_URL}${endPoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching user profile: ${data.status}`);
    return data.json();
  }

  async addComment(comment: string, constellationId: number): Promise<boolean> {
    try {
      const user = await this.getMyProfile();
      
      const commentData = {
        userNick: user.nick,
        comment: comment,
        constellationId: constellationId,
      };
      const data = await fetch(`${this.API_URL}${this.Comment}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
      if (!data.ok) throw new Error(`Error fetching user comments: ${data.status}`);
      const response = await data.text();
      return response === 'true';
    } catch (error: any) {
      console.error('Error al añadir comentario:', error);
      throw error;
    }
  }

  async deleteComment(id: number): Promise<boolean> {
    try{
      const data = await fetch(`${this.API_URL}${this.Comment}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token()}` }
      });
      
      if (!data.ok) {
        const errorText = await data.text();
        throw new Error(`Error actualizando perfil: ${errorText}`);
      }
      const responseText = await data.text();
      return responseText === "Datos Actualizados.";
    } catch (error: any) {
      console.error('Error en la actualización del perfil:', error);
      throw error;
    }
  }

  async addFavorite(id: number): Promise<boolean> {
    const data = await fetch(`${this.API_URL}${this.Favorite}${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching user comments: ${data.status}`);
    const response = await data.text();
    return response === 'true';
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const data = await fetch(`${this.API_URL}${this.Favorite}${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching user comments: ${data.status}`);
    const response = await data.text();
    return response === 'true';
  }

  async isMyFavorite(id: number): Promise<boolean> {
    const data = await fetch(`${this.API_URL}${this.Favorite}${id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!data.ok) throw new Error(`Error fetching user comments: ${data.status}`);
    const response = await data.text();
    return response === 'true';
  }

  async editProfile(profile: User): Promise<boolean> {
    if (!profile.name || !profile.nick || !profile.email || !profile.surname1) {
      throw new Error('Faltan campos obligatorios: nombre, nick, email o apellido');
    }
    const formData = new FormData();
    formData.append('Name', profile.name);
    formData.append('Nick', profile.nick);
    formData.append('Email', profile.email);
    formData.append('Surname1', profile.surname1);
    if (profile.surname2) formData.append('Surname2', profile.surname2);
    if (profile.phoneNumber) formData.append('PhoneNumber', profile.phoneNumber.toString());
    if (profile.userLocation) formData.append('UserLocation', profile.userLocation);
    if (profile.about) formData.append('About', profile.about);
    if (profile.bday) formData.append('Bday', new Date(profile.bday).toLocaleDateString());
    formData.append('PublicProfile', profile.publicProfile === true ? "1" : "0");
    
    try {
      const endPoint = "Account/Update";
      const response = await fetch(`${this.API_URL}${endPoint}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${this.token()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${errorText}`);
      }
      const responseText = await response.text();
      return responseText === "Datos Actualizados.";
    } catch (error: any) {
      throw error;
    }
  }

  async deleteMyAccount(): Promise<void> {
    const endPoint = "Account/Delete";
    const response = await fetch(`${this.API_URL}${endPoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token()}` }
    });
    if (!response.ok) throw new Error(response.statusText);
    sessionStorage.clear();
    this.token.set(null);
    window.location.reload();
  }
}