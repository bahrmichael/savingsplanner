import { Component, NgZone, AfterViewInit, OnDestroy, OnChanges, OnInit, DoCheck } from "@angular/core";
import { DataPoint } from './graph/graph.component';
import { CalculatorService } from './calculator.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Savings Planner';

  public imgUrl: string = "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2000&q=80";

  public fileContent: string;

  public lines: string[];

  public rendering: boolean;
  public isRendered: boolean;

  public totalSavings: number;

  public allInstanceTypes: string[];
  public lambdaSavingsRate: number = 12;
  public ec2SavingsRates: any = [
    {
      'instanceType': 't3.micro',
      'savingsRate': 28
    }
  ];
  public fargateSavingsRate: number = 20;
  public hourlyCommitment: number = 0.03;

  public ec2MultiModeInstanceDistribution: any = {};

  public graphData: DataPoint[];

  constructor(private calc: CalculatorService) {
    this.imgUrl = `https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=${window.innerWidth}&q=80`;
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public redraw($event) {
    this.rendering = true;
    
    this.delay(50).then(() => {
      this.graphData = $event;
      this.totalSavings = this.graphData[this.graphData.length - 1].value;
    })
  }

  public onCostUpload(content: string) {
    this.lines = content.split('\n');
    if (!this.lines || !this.lines[0].startsWith('Service')) {
      alert('The cost report seems invalid. It must start with a line that starts with Service and describes the service names.')
      this.rendering = false;
      return;
    }
    this.fileContent = content;
    // todo: use localStorage or default, so that the user can update values and then reupload a file
    this.graphData = this.calc.calc(this.lines, 0.03, {lambda: 12, fargate: 20, ec2: [
      {
        'instanceType': 't3.micro',
        'savingsRate': 28
      }
    ]}, null);
    this.totalSavings = this.graphData[this.graphData.length - 1].value;
  }

}
