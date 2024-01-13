import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { Subscription, map, timer, timestamp } from 'rxjs';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private mainSvc: MainService, private datePipe:DatePipe) { }

  sensors = [{ id: 188, name: 'SMART188' }, { id: 189, name: 'SMART189' }];
  sensor1Name: string = 'SMART188';
  sensor2Name: string = 'SMART189';
  limitTemp: number = 30;

  value1: any[] = [];
  value2: any[] = [];

  value1Clear: any = {};
  value2Clear: any = {};

  spinner1: boolean = false;
  spinner2: boolean = false;

  sandBoxVar: any = {}

  timerSubs: Subscription = new Subscription;

  formItems: {
        sensor: string,
    queryType: string,
    dateFrom: string,
    dateTo: string,
  } = {
    sensor: "",
    queryType: "",
    dateFrom: "",
    dateTo: "",
  }

  setFormItems(key: number, value: string) {
    switch (key) {
      case 1:
        this.formItems.sensor = value;
        break;
      case 2:
        this.formItems.queryType = value;
        break;
      case 3:
        this.formItems.dateFrom = value;
        break;
      case 4:
        this.formItems.dateTo = value;
        break;

      default:
        break;
    }
  }

  fireQuery() {

  }


  getRangeByDT(name:string, dateFrom:string, dateTo:string){
    this.mainSvc.getHourlyAvgByDTime(name, dateFrom, dateTo).subscribe((data:any) => {
      this.sandBoxVar = data;
      // this.spinner1 = false;
    });
  }



  

  ///////// from here ////////
  //////do Not returning result 
  statuses: any[] = [
    { name: this.sensor1Name, data: {} },
    { name: this.sensor2Name, data: {} }
  ];


  getStatus(id: number) {
    this.mainSvc.getSensorStatus(id).subscribe((data: any) => {
      this.updateStatuses(id, data)
      this.sandBoxVar = data;
    });
  }

  updateStatuses(id: number, newData: any) {
    let indx = this.statuses.findIndex(item => item.name === 'SMART' + id);
    this.statuses[indx]['data'] = newData;
  }
  /////////// To here  /////////
  /////////// However the code is good  /////////

  formatRawData(data: any) {
    let clearData: any = {};
    clearData['timestamp'] = data['timestamp'];
    clearData['temperature'] = data['values'].find((elmt: any) => elmt['sensor'] === 'extT')['value'];
    clearData['temperatureUnit'] = data['values'].find((elmt: any) => elmt['sensor'] === 'extT')['unit'];
    return clearData
  }

  refresh(name: string) {
    if (name == this.sensor1Name) {
      this.spinner1 = true;
      this.mainSvc.getCurrentValue(name).subscribe((data: any) => {
        this.value1Clear = this.formatRawData(data)
        this.value1 = data['values'];
        this.spinner1 = false;
      });
    }
    if (name == this.sensor2Name) {
      this.spinner2 = true;
      this.mainSvc.getCurrentValue(name).subscribe((data:any) => {
        this.value2Clear = this.formatRawData(data)
        this.value2 = data['values']
        this.spinner2 = false;
      });
    }
  }

  ngOnInit() {
    // this.refresh(this.sensor1Name);
    // this.refresh(this.sensor2Name);
    this.sensors.forEach(element => {
      this.getStatus(element.id)
    }); 

    this.timerSubs = timer(0, 60000).pipe( 
      map(() => { 
        this.refresh(this.sensor1Name);
        this.refresh(this.sensor2Name);
      }) 
    ).subscribe(); 
  }

  ngOnDestroy(): void { 
    this.timerSubs.unsubscribe(); 
  } 
  
}
