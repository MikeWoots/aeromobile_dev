import { Component } from '@angular/core';
import {NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private clientID: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.clientID = navParams.get('clientID');
    console.log(this.clientID);
  }

}
