import { Injectable } from '@angular/core';
import { Constellation } from '../../models/constellation';
import { Star } from '../../models/star';
import { ConstellationLines } from '../../models/constellationlines';
import { Comments } from '../../models/comments';

@Injectable({
  providedIn: 'root'
})
export class ConstellationsService {

  private readonly API_URL = 'https://88.24.26.59/api/'

  constructor() { }

  async getAll(): Promise<Constellation[]> {
    const data = await fetch(`${this.API_URL}Constellations`);
    if (!data.ok) throw new Error(`Error fetching constellations: ${data.status}`);
    return data.json();
  }

  async getById(id: number): Promise<Constellation> {
    const data = await fetch(`${this.API_URL}Constellations/${id}`);
    if (!data.ok) throw new Error(`Error fetching constellation: ${data.status}`);
    return data.json();
  }

  async getStars(id: number): Promise<Star[]> {
    const data = await fetch(`${this.API_URL}Constellations/GetStars/${id}`);
    if (!data.ok) throw new Error(`Error fetching stars for constellation ${id}: ${data.status}`);
    return data.json();
  }

  async getConstellationLines(): Promise<ConstellationLines> {
    const data = await fetch(`${this.API_URL}Constellations/ConstelationLines`);
    if (!data.ok) throw new Error(`Error fetching constellation lines: ${data.status}`);
    return data.json();
  }

  async getCommentsById(id: number): Promise<Comments[]> {
    const data = await fetch(`${this.API_URL}Account/GetComments/${id}`);
    if (!data.ok) throw new Error(`Error fetching comments for constellation ${id}: ${data.status}`);
    return data.json();
  }
}