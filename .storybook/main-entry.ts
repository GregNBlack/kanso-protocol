import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({ selector: 'kp-root', standalone: true, template: '' })
class StubComponent {}

bootstrapApplication(StubComponent).catch(e => console.error(e));
