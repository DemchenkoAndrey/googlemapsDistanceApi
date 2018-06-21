import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {Place} from "./place";
import {HttpClient} from "@angular/common/http";


interface GeocodehResultsModel {
  destination_addresses: string[],
  origin_addresses: string[],
  rows: [{elements: [{distance: {text: string, value: string}}]}]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  google_key: string = 'key=AIzaSyChseIXTl3mrJp_diMqP_LaX_qL2jPm5WQ';
  latitude: any;
  longitude: any;
  places: Array<Place> = [];
  constructor (private element: ElementRef,
               private http: HttpClient) {}

  ngOnInit() {
    const mapProp = {
      center: new google.maps.LatLng(53.887381, 27.547850),
      zoom: 10,
      disableDoubleClickZoom: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    google.maps.event.addListener(this.map, 'dblclick',  (event) => {
      this.element.nativeElement.querySelector('#lat').value = event.latLng.lat().toFixed(5);
      this.element.nativeElement.querySelector('#lon').value = event.latLng.lng().toFixed(5);
    });
  }
 addPlace(latitude, longitude) {
    if (latitude && longitude) {
      let result: any;
      this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&${this.google_key}`)
        .subscribe(res => {
          result = res;
          if (result.status === 'OK') {
            const address: string = result.results[0].formatted_address;
            this.createPlace(latitude, longitude, address);
          }
        });
    } else {
      return;
    }
  }

  createPlace(latitude, longitude, address) {
    if (this.places.length > 0) {
      const params: string = [
        `origins=${this.places[this.places.length - 1].full_adress}`,
        `destinations=${address}`,
      ].join('&');
      this.http.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metrikal&${params}&${this.google_key}`)
        .subscribe((res: GeocodehResultsModel) => {
          const distance = res.rows[0].elements[0].distance.text;
          const distance_value = res.rows[0].elements[0].distance.value;
          const place = new Place(latitude, longitude, address, distance, distance_value);
          this.places.push(place);
          console.log(this.places);
        });
    } else {
      const place = new Place(latitude, longitude, address);
      this.places.push(place);
    }
  }
}

