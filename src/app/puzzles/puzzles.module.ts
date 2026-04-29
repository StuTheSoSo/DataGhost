import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PuzzleModalComponent } from './puzzle-modal/puzzle-modal.component';
import { CipherPuzzleComponent } from './cipher/cipher-puzzle.component';
import { NetworkTopologyPuzzleComponent } from './network-topology/network-topology-puzzle.component';
import { PatternIntrusionPuzzleComponent } from './pattern-intrusion/pattern-intrusion-puzzle.component';
import { BinaryHexPuzzleComponent } from './binary-hex/binary-hex-puzzle.component';
import { SocialEngineeringPuzzleComponent } from './social-engineering/social-engineering-puzzle.component';
import { FilesystemTraversePuzzleComponent } from './filesystem-traverse/filesystem-traverse-puzzle.component';
import { PasswordCascadePuzzleComponent } from './password-cascade/password-cascade-puzzle.component';

@NgModule({
  declarations: [
    PuzzleModalComponent,
    CipherPuzzleComponent,
    NetworkTopologyPuzzleComponent,
    PatternIntrusionPuzzleComponent,
    BinaryHexPuzzleComponent,
    SocialEngineeringPuzzleComponent,
    FilesystemTraversePuzzleComponent,
    PasswordCascadePuzzleComponent
  ],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [PuzzleModalComponent]
})
export class PuzzlesModule {}
