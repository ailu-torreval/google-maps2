import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '../modal/modal.page';
import { Geolocation } from '@capacitor/geolocation';
import { MapGeocoder, MapGeocoderResponse } from '@angular/google-maps';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  showLoc: boolean = false;
  address: string ='';
  @ViewChild('map')
  mapRef!: ElementRef;
  map!: GoogleMap;

  constructor(private modalCtrl: ModalController, private geoCoder: MapGeocoder) {}

  ionViewDidEnter() {
  this.createMap(33.7, -117.2);
  }

  async createMap(lat: number, long:number) {
    console.log("from create map");
    this.showLoc = true;
    
    this.map = await GoogleMap.create({
    id: 'my-map',
    apiKey: 'AIzaSyAVvDDDGd4c0erwMlPVtgxPq4qk4E1nO14',
    // apiKey: environment.mapsKey,
    element: this.mapRef.nativeElement,
    forceCreate: true,
    config: {
      center: {
        lat:lat,
        lng: long,
      }, 
      zoom: 9,
    },
    });  
    this.addMarkers(lat, long)
  }

  async addMarkers(lat:number, long: number) {
    // const markers: Marker[] = [
    //   {
    //     coordinate: {
    //       lat: 33.7,
    //       lng: -117.2
    //     },
    //     title:'my house',
    //     snippet: 'coolest place'
    //   }, 
    //   {
    //     coordinate: {
    //       lat: 32.7,
    //       lng: -116.2
    //     },
    //     title:'my house2',
    //     snippet: 'coolest place'
    //   }
    // ];

    const marker: Marker =
      {
        coordinate: {
          lat: lat,
          lng: long
        },
        title:'my house',
        snippet: 'coolest place'
      };
    // await this.map?.addMarkers(markers);
     await this.map?.addMarker(marker);
    this.map.setOnMarkerClickListener( async (marker) => {
      const modal = await this.modalCtrl.create({
        component: ModalPage,
        componentProps: {
          marker,
        },
        breakpoints: [0, 0.3],
        initialBreakpoint: 0.3,
      });
      modal.present();
    });
  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    console.log("get location", coordinates.coords.latitude);
    console.log("get location", coordinates.coords.longitude);
    this.createMap(coordinates.coords.latitude, coordinates.coords.longitude)
    this.getAddress(coordinates.coords.latitude, coordinates.coords.longitude)
    
  }

  async getAddress(lat:number, long: number) {
    this.geoCoder
      .geocode({ location: { lat: lat, lng: long } })
      .subscribe((addr: MapGeocoderResponse) => {
        if (addr.status === 'OK') {
          if (addr.results[0]) {
            this.address = addr.results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + addr.status);
        }
      });

  }

}
