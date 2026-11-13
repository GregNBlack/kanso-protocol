import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KpButtonComponent } from '@kanso-protocol/ui/button';
import { KpSelectComponent } from '@kanso-protocol/ui/select';
import { KpDialogComponent } from '@kanso-protocol/ui/dialog';
@Component({standalone:true, selector:'app-root', imports:[ReactiveFormsModule,KpButtonComponent,KpSelectComponent,KpDialogComponent], template:`<button kpButton (click)="open = true">Open</button><kp-select [formControl]="choice" /><kp-dialog [(open)]="open">Smoke test</kp-dialog>`})
class Smoke { readonly choice = new FormControl(''); open = false; }
bootstrapApplication(Smoke);
