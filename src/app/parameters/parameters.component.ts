import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CalculatorService } from '../calculator.service';
import { DataPoint } from '../graph/graph.component';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.css']
})
export class ParametersComponent implements OnInit {

  public valuesChanged: boolean;

  public ec2MultiMode: boolean;
  
  @Input() lines: string[];
  @Output() onRedraw: EventEmitter<DataPoint[]> = new EventEmitter();

  public emitRedraw() {
    this.valuesChanged = false;
    
    const graphData = this.calc.calc(this.lines, this.hourlyCommitment, {lambda: this.lambdaSavingsRate, fargate: this.fargateSavingsRate, ec2: 
      this.ec2SavingsRates
    }, this.ec2MultiModeInstanceDistribution, this.allInstanceTypes);

    this.onRedraw.emit(graphData);
  }

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

  public ec2MultiModeInstanceDistribution: any;

  constructor(private calc: CalculatorService) { }

  ngOnInit(): void {
  }

  public onInstanceUpload(content: string) {
    const instanceLines = content.split('\n');
    if (!instanceLines || !instanceLines[0].startsWith('InstanceType')) {
      alert('The EC2 cost report seems invalid. It must start with a line that starts with InstanceType and then follows with various instance types.')
      return;
    }

    this.ec2SavingsRates = [];
    this.allInstanceTypes = instanceLines[0].split(',');
    for (let index = 0; index < this.allInstanceTypes.length; index++) {
      const instanceType = this.allInstanceTypes[index];
      if (['InstanceType', 'No Instance Type($)', 'Total cost ($)'].indexOf(instanceType) != -1) {
        continue;
      }
      this.ec2SavingsRates.push({
        instanceType,
        savingsRate: 0,
        index
      })
    }

    this.ec2MultiModeInstanceDistribution = {};
    
    for (const line of instanceLines.slice(2)) {
      const data = line.split(',');
      const date = data[0];
      this.ec2MultiModeInstanceDistribution[date] = {};
      for (let index = 1; index < data.length; index++) {
        const element = data[index];
        this.ec2MultiModeInstanceDistribution[date][index] = +element;
      }
    }
  }

}
