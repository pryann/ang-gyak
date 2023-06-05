# Angular Component - Gyakorlás

## Kezdő lépések
- Lépj be a klónozott mappába, és állítsd be a projektet:
- `cd <repo-name>`
- `code . -r`
- Telepítsd a függőségeket:
- `npm i`
- Indítsd el az Angular Development Server-t:
- `npm start`

## Feladatok
- FONTOS! Adatkötésekkel dolgozz, semmilyen adatot ne fixálj a HTML-állományokban!
- PONTOSAN EBBEN A SORRENDBEN NYISD MEG A FÁJLOKAT ÉS DOLGOZZ!
- `src\app\user-detail\user-detail.component.ts`
- `src\app\user-detail\user-detail.component.html`
- `src\app\user-list\user-list.component.ts`
- `src\app\user-list\user-list.component.html`
- `src\app\app.component.ts`
- `src\app\app.component.html`

## Tesztelés
- Készítettem egy animációt.
- Ez alapján készítsd el az alkalmazást.

## Segítség
> Ha egy component-nek át akarsz adni egy változót, csak 
akkor tudod megtenni, ha a component várja azt. Azaz annak 
a változónak definiálva kell lennie a component-ben mint 
@Input tulajdonság.  
> Ezután egyszerű property-binding-gal tudod átadni:  
> `<app-test [user]="currentUser"></app-test>`  
  
> Ha egy component-nek van egy eseménye, arra event-binding 
segítségével tudsz felíratkozni. Ezt az eseményt is létre 
kell hozni először @Output tulajdonságként.
> `<app-test (delUser)="onDelUser(user)"></app-test>`
  

