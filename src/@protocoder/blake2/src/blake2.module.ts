import { NgModule } from '@angular/core';
import { Blake2bService } from './blake2b.service';
import { Blake2sService } from './blake2s.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [Blake2bService, Blake2sService]
})
export class Blake2Module {
}
