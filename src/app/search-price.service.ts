import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchPriceService {

  constructor() { }


  // public doSearch() {
  //   this.searchResult = this.search();
  // }

  // public search(hc: number = this.hourlyCommitment, previousBest: number = 0, direction: number = 0) {
  //   if (direction == 0) {
  //     const up = this.search(hc, previousBest, 1);
  //     console.log('up', up);
  //     const down = this.search(hc, previousBest, -1);
  //     console.log('down', down);
  //     return up.result > down.result ? up : down;
  //   } else {
  //     console.log('Testing HC', hc, previousBest, direction);
      
  //     const data = this.calc(this.fileContent.split('\n'), hc);
  //     const hcResult = data[data.length - 1].value;

  //     console.log('Result HC', hc, hcResult);

  //     if (hcResult > previousBest) {
  //       return this.search(hc + direction * 0.01, hcResult, direction);
  //     } else {
  //       const result = hcResult > previousBest ? {hc, result: hcResult} : {hc: hc + (-1 * direction) * 0.01, result: previousBest};
  //       console.log('Finished', result);
        
  //       return result;
  //     }
  //   }
  // }
}
