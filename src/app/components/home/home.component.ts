import { Component, OnInit, inject } from '@angular/core';
import { MainService } from '../../services/main.service';
import { Subscription, interval, map, min, timeout, timer, timestamp } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import { ColDef, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy, ValueFormatterParams } from 'ag-grid-community';


type FormItems = {
  sensor: string,
  queryType: string,
  dateFrom: string,
  dateTo: string
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private mainSvc: MainService, private datePipe: DatePipe, private dcmPipe: DecimalPipe) { }

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
  // formItems: FormItems = {
  //   sensor: "SMART188",
  //   queryType: "1",
  //   dateFrom: "2024-01-13",
  //   dateTo: "2024-01-13",
  // }
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
  models: { from: NgbDateStruct, to: NgbDateStruct } = {
    from: {
      year: NaN,
      month: NaN,
      day: NaN
    },
    to: {
      year: NaN,
      month: NaN,
      day: NaN
    }
  };

  downloadError: string = ""


  // row Datas
  rowData: any[] = [
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "AUX1" },
    { field: "AUX2" },
    { field: "AUX3" },
    { field: "co" },
    { field: "extT" },
    { field: "intT" },
    { field: "lat" },
    { field: "lon" },
    { field: "no2" },
    { field: "o3" },
    { field: "pm10" },
    { field: "pm25" },
    { field: "rh" },
    { field: "AUX1_INPUT" },
    { field: "AUX2_INPUT" },
    { field: "utc_timestamp", headerName: "Time and Date", valueFormatter: this.dTFormat, pinned: 'left' }
  ];


  autoSizeStrategy:
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy = {
      type: 'fitCellContents',
    };

  dTFormat(params: ValueFormatterParams) {
    let date = new Date(params.value)
    let h = (date.getHours().toString().length === 1) ? '0' + date.getHours() : date.getHours()
    let m = (date.getMinutes().toString().length === 1) ? '0' + date.getMinutes() : date.getMinutes()
    return date.toDateString() + ' ' + h + ':' + m
  }

  getValuesByDT() {
    this.queryspinner = true;
    this.mainSvc.getValuesByDTime(this.formItems.sensor, this.formItems.dateFrom, this.formItems.dateTo).subscribe((data: any) => {
      this.rowData = data['raw_data']
      this.queryspinner = false;
    });
  }

  DownloadCSVByDT() {
    this.queryspinner = true;
    this.mainSvc.getHourlyAvgByDTime(this.formItems.sensor, this.formItems.dateFrom, this.formItems.dateTo).subscribe(
      (blob: Blob) => { saveAs(blob, this.formItems.sensor + '_file_from_' + this.formItems.dateFrom + '_to_' + this.formItems.dateTo + '.csv') },
      (error) => { this.downloadError = 'Failed to download file. Please try again later', setTimeout(() => this.downloadError = '', 5000), this.queryspinner = false },
      () => this.queryspinner = false
    )
  }

  minOfModel(modl1: NgbDateStruct, modl2: NgbDateStruct) {
    let a = new Date(this.modelToISO(modl1));
    let b = new Date(this.modelToISO(modl2));
    return a < b ? modl1 : b < a ? modl2 : modl2
  }

  modelToISO(modl: NgbDateStruct) {
    let month = this.dcmPipe.transform(modl.month, "2.0-0")
    return modl.year + '-' + month + '-' + modl.day;
  }

  setPickedDates(index: number) {
    switch (index) {
      case 1:
        this.formItems.dateFrom = this.modelToISO(this.models['from'])
        break;
      case 2:
        this.formItems.dateTo = this.modelToISO(this.models['to'])
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
