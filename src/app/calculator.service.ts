import { Injectable } from '@angular/core';
import { DataPoint } from './graph/graph.component';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }

  getIndices(services: string[]) {
    const ec2 = services.indexOf("EC2-Instances($)");
    const fargate = services.indexOf("EC2 Container Service($)");
    const lambda = services.indexOf("Lambda($)");
    return {ec2, fargate, lambda};
  }

  getSpendings(cells: string[], indices:any) {
    return {
      ec2: this.getSpending(cells, indices.ec2),
      lambda: this.getSpending(cells, indices.lambda),
      fargate: this.getSpending(cells, indices.fargate),
    }
  }

  getSpending(cells: string[], index: number) {
    return index != -1 ? (+cells[index]) / 24 : 0;
  }

  public calc(rows: string[], hourlyCommitment: number, rates: any, ec2Distribution: any = null, allInstanceTypes: any = null): DataPoint[] {
    const indices = this.getIndices(rows[0].split(','))

    // sort from highest to lowest
    rates.ec2.sort((a, b) => b.savingsRate - a.savingsRate);
    // console.log('rates sorted', this.ec2SavingsRates);

    const data = [];
    let total = 0;
    for (const row of rows.slice(2)) {
      const cells = row.split(',');

      const spendings = this.getSpendings(cells, indices);

      const rowResult = this.calcRow(hourlyCommitment, spendings, rates, ec2Distribution ? ec2Distribution[cells[0]] : null, allInstanceTypes);

      const daily = rowResult.ec2 + rowResult.fargate + rowResult.lambda - rowResult.overpay;
      total = total + daily;

      data.push({
        'date': cells[0],
        'value': total,
      });
    }

    // this.totalSavings = data[data.length - 1].value;
    return data;
  }

  getInstanceSpending(instanceType: string, totalSpending: number, spendingDistribution: any = null, allInstanceTypes: string[] = []): number {
    let spending = totalSpending;
    if (spendingDistribution) {
      const rateIndex = allInstanceTypes.indexOf(instanceType);
      if (rateIndex != -1) {
        const instanceMaxSpend = spendingDistribution[rateIndex] / 24;
        console.log('instanceMaxSpend', instanceMaxSpend);

        spending = instanceMaxSpend < spending ? instanceMaxSpend : spending;
      }
    }
    return spending;
  }


  calcRow(hourlyCommitment: number, spending: any, rates: any, ec2SpendingDistribution: any, allInstanceTypes: any) {
    // console.log('calc input', spending, ec2SpendingDistribution, hourlyCommitment);

    const rowSaving = { ec2: 0, fargate: 0, lambda: 0, overpay: 0 }
    let remainingCommitment: number = hourlyCommitment;
    for (const ec2Rate of rates.ec2) {
      let instanceSpend = this.getInstanceSpending(ec2Rate.instanceType, spending.ec2, ec2SpendingDistribution, allInstanceTypes);
      rowSaving.ec2 += this.getServiceSavings(instanceSpend, ec2Rate.savingsRate, remainingCommitment);
      remainingCommitment -= instanceSpend;
      if (remainingCommitment <= 0) {
        return rowSaving;
      }
    }
    
    rowSaving.fargate = this.getServiceSavings(spending.fargate, rates.fargate, remainingCommitment);
    remainingCommitment -= spending.fargate;
    if (remainingCommitment <= 0) {
      return rowSaving;
    }
    
    rowSaving.lambda = this.getServiceSavings(spending.lambda, rates.lambda, remainingCommitment);
    remainingCommitment -= spending.lambda;
    if (remainingCommitment <= 0) {
      return rowSaving;
    }

    return { ...rowSaving, 'overpay': remainingCommitment * 24 };
  }


  getServiceSavings(spendingPerHour: number, rate: number, remainingCommitment: number) {
    if (spendingPerHour >= remainingCommitment) {
      return this.getSavings(remainingCommitment, rate);
    } else {
      return this.getSavings(spendingPerHour, rate);
    }
  }

  getSavings(spendingPerHour: number, rate: number) {
    if (rate < 1 && rate > 0) {
      throw Error(`${rate} should be an integer representing a percentage (i.e. 20 for 20%)`);
    }
    return spendingPerHour * rate / 100 * 24;
  }
}
