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
  google_distance_API: string = 'key=AIzaSyB93JaeySL-BeRrHPEZl8x6ZeatQysWlcA';
  google_geocode_API: string = 'key=AIzaSyDE6HFdEut-jsvgPkfNXppri06zR_FE1yk';
  latitude: any;
  longitude: any;
  total: number;
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
      this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&${this.google_geocode_API}`)
        .subscribe(res => {
          result = res;
          if (result.status === 'OK') {
            const address: string = result.results[0].formatted_address;
            this.createPlace(latitude, longitude, address);
            this.element.nativeElement.querySelector('#lat').value = '';
            this.element.nativeElement.querySelector('#lon').value = '';
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
      this.http.get(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}&${this.google_distance_API}`)
        .subscribe((res: GeocodehResultsModel) => {
          const distance = res.rows[0].elements[0].distance.text;
          const distance_value = res.rows[0].elements[0].distance.value;
          const place = new Place(longitude, latitude, address, distance, distance_value);
          this.places.push(place);
          this.sumTotal();
          console.log(this.places);
        });
    } else {
      const place = new Place(latitude, longitude, address);
      this.places.push(place);
    }
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

