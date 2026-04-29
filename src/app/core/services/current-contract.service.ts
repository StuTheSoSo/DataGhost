import { Injectable } from '@angular/core';
import { Contract } from '../models/game.models';

@Injectable({ providedIn: 'root' })
export class CurrentContractService {
  contract: Contract | null = null;
}
