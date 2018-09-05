import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Place} from './place';
import {HttpClient} from '@angular/common/http';

const service = new google.maps.DistanceMatrixService();

interface GeocodehResultsModel {
  newAddressddresses: string[];
  originAddresses: string[];
  rows: [{ elements: [{ distance: { text: string, value: string } }] }];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  google_geocode_API = 'key=AIzaSyDE6HFdEut-jsvgPkfNXppri06zR_FE1yk';
  latitude: any;
  longitude: any;
  total: number;
  places: Array<Place> = [];

  constructor(private element: ElementRef,
              private http: HttpClient) {
  }

  ngOnInit() {
    const mapProp = {
      center: new google.maps.LatLng(53.887381, 27.547850),
      zoom: 10,
      disableDoubleClickZoom: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    google.maps.event.addListener(this.map, 'dblclick', (event) => {
      this.element.nativeElement.querySelector('#lat').value = event.latLng.lat().toFixed(5);
      this.element.nativeElement.querySelector('#lon').value = event.latLng.lng().toFixed(5);
    });
  }

  addPlace(latitude, longitude) {
    if (latitude && longitude) {
      let result: any;
      this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&${this.google_geocode_API}`)
        .subscribe(res => {
          result = res;
          if (result.status === 'OK') {
            const address: string = result.results[0].formatted_address;
            this.element.nativeElement.querySelector('#lat').value = '';
            this.element.nativeElement.querySelector('#lon').value = '';
            this.createPlace(latitude, longitude, address);
          }
        });
    } else {
      return;
    }
  }

  async createPlace(latitude, longitude, address) {
    if (this.places.length > 0) {

      const previousAddress = this.places[this.places.length - 1].full_adress;
      const newAddress = address;
      const destination = await this.getDestination(previousAddress, newAddress);
      const distance = destination.rows[0].elements[0].distance.text;
      const distance_value = destination.rows[0].elements[0].distance.value;
      const place = new Place(latitude, longitude, address, distance, distance_value);
      this.places.push(place);
      console.log(this.places);
      this.sumTotal();
    } else {
      const place = new Place(latitude, longitude, address);
      this.places.push(place);
    }
  }

  getDestination(previousAddress, newAddress): Promise<GeocodehResultsModel> {
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [previousAddress],
          destinations: [newAddress],
          travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            // @ts-ignore
            return resolve(response);
          } else {
            return reject('some err');
          }
        }
      );
    });
  }

  sumTotal() {
    let sum = 0;
    const Arr = this.places.map(el => {
      return el.distance_value;
    });

    Arr.forEach(el => {
      if (el !== undefined) {
        sum += el;
      }
    });
    this.total = sum / 1000;
  }
}

