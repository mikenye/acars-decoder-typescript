import { DecoderPlugin } from '../DecoderPlugin';

// In Air Report
export class Label_44_ETA extends DecoderPlugin {
  name = 'label-44-eta';

  qualifiers() { // eslint-disable-line class-methods-use-this
    return {
      labels: ['44'],
      preambles: ['00ETA01', '00ETA02', '00ETA03', 'ETA01', 'ETA02', 'ETA03'],
    };
  }

  decode(message: any) : any {
    const decodeResult: any = this.defaultResult;
    decodeResult.decoder.name = this.name;
    decodeResult.formatted.description = 'ETA Report';
    decodeResult.message = message;

    // Style: IN02,N38338W121179,KMHR,KPDX,0806,2355,005.1
    // Match: IN02,coords,departure_icao,arrival_icao,current_date,current_time,fuel_in_tons
    const regex = /^IN02,(?<unsplit_coords>.*),(?<departure_icao>.*),(?<arrival_icao>.*),(?<current_date>.*),(?<current_time>.*),(?<fuel_in_tons>.*)$/;
    const results = message.text.match(regex);
    if (results) {
      console.log(`Label 44 ETA Report: groups`);
      console.log(results.groups);

      const coordsRegex = /(?<lac>[NS])(?<la>.+)\s*(?<lnc>[EW])(?<ln>.+)/;
      const coordsResults = results.groups.unsplit_coords.match(coordsRegex);

      decodeResult.raw.latitude_direction = coordsResults.groups.lac;
      decodeResult.raw.latitude = Number(coordsResults.groups.la) / 1000;
      decodeResult.raw.longitude_direction = coordsResults.groups.lnc;
      decodeResult.raw.longitude = Number(coordsResults.groups.ln) / 1000;
      decodeResult.raw.departure_icao = results.groups.departure_icao;
      decodeResult.raw.arrival_icao = results.groups.arrival_icao;
      decodeResult.raw.current_time = Date.parse(
        new Date().getFullYear() + "-" +
        results.groups.current_date.substr(0, 2) + "-" +
        results.groups.current_date.substr(2, 2) + "T" +
        results.groups.current_time.substr(0, 2) + ":" +
        results.groups.current_time.substr(2, 2) + ":00Z"
      );

      if (results.groups.fuel_in_tons != '***' && results.groups.fuel_in_tons != '****') {
        decodeResult.raw.fuel_in_tons = Number(results.groups.fuel_in_tons);
      }

      decodeResult.formatted.items.push({
        type: 'aircraft_position',
        code: 'POS',
        label: 'Aircraft Position',
        value: `${decodeResult.raw.latitude} ${decodeResult.raw.latitude_direction}, ${decodeResult.raw.longitude} ${decodeResult.raw.longitude_direction}`,
      });

      decodeResult.formatted.items.push({
        type: 'origin',
        code: 'ORG',
        label: 'Origin',
        value: decodeResult.raw.departure_icao,
      });

      decodeResult.formatted.items.push({
        type: 'destination',
        code: 'DST',
        label: 'Destination',
        value: decodeResult.raw.arrival_icao,
      });

    }

    decodeResult.decoded = true;
    decodeResult.decoder.decodeLevel = 'full';

    return decodeResult;
  }
}

export default {};
