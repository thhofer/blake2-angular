import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { Blake2Module } from '../@protocoder/blake2/src/blake2.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Blake2Module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
