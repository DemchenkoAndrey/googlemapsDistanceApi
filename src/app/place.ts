export class Place {
  long: string;
  lang: string;
  full_adress: string;
  distance: string;
  distance_value: number;
    constructor(long, lang, address, distance?, value?) {
      this.long = long;
      this.lang = lang;
      this.full_adress = address;
      this.distance = distance || 'Start';
      this.distance_value = value;
  }
}
