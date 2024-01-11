
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

let url: string = 'https://airqino-api.magentalab.it/'

@Injectable({
  providedIn: 'root'
})

export class MainService {
  constructor(private http: HttpClient){}

  getCurrentValue(stationName:string){
    let res= this.http.get(url+'getCurrentValues/'+stationName);
    return res;
  }

  getSensorStatus(stationId:number){
    return this.http.get(url+'getStationStatus/'+stationId);
  }

  getValuesByDTimeRange(stationName:string,dtFrom:string, dtTo:string){
    return this.http.get(url+'getRange/'+stationName+'/'+dtFrom+'/'+dtTo)
  }

  getHourlyAvgByDTRange(stationName:string,dtFrom:string, dtTo:string){
    return this.http.get(url+'getHourlyAvg/'+stationName+'/'+dtFrom+'/'+dtTo)
  }
}
