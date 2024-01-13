import { Component, OnInit, inject } from '@angular/core';
import { MainService } from '../../services/main.service';
import { Subscription, interval, map, timeout, timer, timestamp } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';

type FormItems = {
  sensor: string,
  queryType: string,
  dateFrom: string,
  dateTo: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private mainSvc: MainService, private datePipe: DatePipe,private dcmPipe: DecimalPipe) { }

  sensors = [{ id: 188, name: 'SMART188' }, { id: 189, name: 'SMART189' }];
  fetchType = [{ id: 1, name: "1", descr: 'Get Range' }, { id: 2, name: "2", descr: 'Get Hourly AVG (CSV)' }];
  sensor1Name: string = 'SMART188';
  sensor2Name: string = 'SMART189';
  limitTemp: number = 30;

  dt1 = "2024-01-01";
  dt21 = "2024-01-11";
  dt2 = this.datePipe.transform(Date(), 'YYYY-mm-dd');

  value1: any[] = [];
  value2: any[] = [];

  value1Clear: any = {};
  value2Clear: any = {};

  spinner1: boolean = false;
  spinner2: boolean = false;
  queryspinner: boolean = false;

  sandBoxVar: any = {}

  timerSubs: Subscription = new Subscription;

  formItems: FormItems = {
    sensor: "",
    queryType: "",
    dateFrom: "",
    dateTo: "",
  }
  today = inject(NgbCalendar).getToday();
  yearBeforeToday = {
    year: this.today.year - 1,
    month: this.today.month,
    day: this.today.day
  }
  models: {from:NgbDateStruct, to:NgbDateStruct} = {
    from:{
      year: NaN,
      month: NaN,
      day: NaN
    }, 
    to:{
      year: NaN,
      month: NaN,
      day: NaN
    }
  };
  
  downloadError: string = ""


	// date: { year: number; month: number } = {year:this.today.year, month:this.today.month};
  modelToISO(modl:NgbDateStruct) {
    let month = this.dcmPipe.transform(modl.month, "2.0-0")
    return modl.year+'-'+month+'-'+modl.day;
  }

  setPickedDates(index:number){
     switch (index) {
      case 1:
        this.formItems.dateFrom=this.modelToISO(this.models['from'])
        break;
        case 2:
          this.formItems.dateTo=this.modelToISO(this.models['to'])
        break;
      default:
        break;
       }
      }

  setFormItems(key: number, value: string) {
    switch (key) {
      case 1:
        this.formItems.sensor = value;
        break;
      case 2:
        this.formItems.queryType = value;
        break;

      default:
        break;
    }
  }

  getValuesByDT() {
    this.queryspinner = true;
    this.mainSvc.getValuesByDTime(this.formItems.sensor, this.formItems.dateFrom, this.formItems.dateTo).subscribe((data: any) => {
      this.sandBoxVar = data;
      this.queryspinner = false;
    });
  }

  DownloadCSVByDT() {
    this.queryspinner = true;
    this.mainSvc.getHourlyAvgByDTime(this.formItems.sensor, this.formItems.dateFrom, this.formItems.dateTo).subscribe(
      (blob: Blob) => {saveAs(blob, this.formItems.sensor+'_file_from_'+this.formItems.dateFrom +'_to_'+ this.formItems.dateTo+'.csv')},
      (error) => {this.downloadError='Failed to download file. Please try again later',setTimeout(() => this.downloadError='', 5000),this.queryspinner = false},
      ()=>this.queryspinner = false
    )
  }

  
    getQueryDesc(name: string) {
      return this.fetchType.find(i => i.name === name)?.descr
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
      this.mainSvc.getCurrentValue(name).subscribe((data: any) => {
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
