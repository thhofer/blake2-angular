# Blake2Angular

This is an angular implementation of the blake2 hashing algorithm, using pure typescript.

## Acknowledgments

The code in this project is very closely based on that of the
[blakejs](https://www.npmjs.com/package/blakejs) module.

I needed this functionality to be available as an angular module and it turns out porting it was
simpler than messing around with type definitions and imports that resisted heavily against being
included in an angular project.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version
1.7.3 and subsequently upgraded to angular 7.

## Usage

Install the dependency using `npm i -s @protocoder/blake2-angular`.

Then simply import the `Blake2Module` into your module and the `Blake2bService` will be made
available for injection.
