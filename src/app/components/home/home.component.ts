import { Component, OnInit } from '@angular/core';
import { MainService } from '../../services/main.service';
import { timestamp } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private mainSvc: MainService) { }

  sensors = [{ id: 188, name: 'SMART188' }, { id: 189, name: 'SMART189' }];
  sensor1Name: string = 'SMART188';
  sensor2Name: string = 'SMART189';

  value1: any = {};
  value2: any = {};

  value1Clear: any = {};
  value2Clear: any = {};

  spinner1: boolean = false;
  spinner2: boolean = false;
  
  sandBoxVar:any = {}


  ///////// from here ////////
  //////do Not returning result 
  statuses:any[] = [
    {name:this.sensor1Name, data :{}},
    {name:this.sensor2Name, data : {}}
  ] ;

 
  getStatus(id:number){
    this.mainSvc.getSensorStatus(id).subscribe((data:any) => {
      this.updateStatuses(id, data)
      this.sandBoxVar = data;
    });
  }

  updateStatuses(id:number,newData:any){
    let indx = this.statuses.findIndex(item=>item.name=='SMART'+id);
    this.statuses[indx]['data']=newData;
  }
  /////////// To here  /////////
  /////////// However the code is good  /////////

  formatRawData(data:any){
    let clearData: any={};
    clearData['timestamp']=data['timestamp'];
    clearData['temperature']=data['values'].find((elmt: any) => elmt['sensor']='extT')['value'];
    clearData['temperatureUnit']=data['values'].find((elmt: any) => elmt['sensor']='extT')['unit'];
    return clearData
  }

  refresh(name: string) {
    if (name == this.sensor1Name) {
      this.spinner1 = true;
      this.mainSvc.getCurrentValue(name).subscribe((data:any) => {
        this.value1Clear = this.formatRawData(data)
        this.value1 = data['values'];
        this.spinner1 = false;
      });
    }
    if (name == this.sensor2Name) {
      this.spinner2 = true;
      this.mainSvc.getCurrentValue(name).subscribe((data:any) => {
        this.value2 = data
        this.spinner2 = false;
      });
    }
  }

  ngOnInit() {
    this.refresh(this.sensor1Name);
    this.refresh(this.sensor2Name);
    this.sensors.forEach(element => {
      this.getStatus(element.id)
    }); 
  }

}
