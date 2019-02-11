import { Component, ElementRef, ViewChild } from '@angular/core';
import { Blake2bService } from '../@protocoder/blake2/src/blake2b.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('plaintext') plaintext: ElementRef;

  title = 'Blake2-angular demo';
  content = '';

  constructor(private blake2b: Blake2bService) {}

  hash() {
    const input = this.plaintext.nativeElement;
    this.content = this.blake2b.hashToHex(input.value);
  }
}

