import { Component, OnInit, OnDestroy, NgZone, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export interface DataPoint {
  date: string;
  value: number;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, OnDestroy, OnChanges {

  @Input() data: DataPoint[] = [];
  @Output() onReady: EventEmitter<void> = new EventEmitter();

  private chart: am4charts.XYChart;

  constructor(private zone: NgZone) { }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.data = this.data;
      // this.delay(100).then(() => {
      //   this.onReady.emit();
      // })
    }
  }

  ngOnInit(): void {
    am4core.useTheme(am4themes_animated);
    this.graph();
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  graph() {

    // if (this.chart) {
    //   this.chart.dispose();
    // }

    // Themes begin
    // Themes end

    // Create chart instance
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
   this.chart.events.on('validated', () => {
     this.onReady.emit();
    });
    this.chart.paddingRight = 20;

    // Add data
    this.chart.data = this.data;

    // Create axes
    var categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "date";
    categoryAxis.renderer.minGridDistance = 100;
    categoryAxis.renderer.grid.template.location = 0.5;
    categoryAxis.startLocation = 0.5;
    categoryAxis.endLocation = 0.5;
    categoryAxis.renderer.labels.template.fontSize = 15;

    // Create value axis
    var valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.baseValue = 0;

    // Create series
    var series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "date";
    series.strokeWidth = 2;
    // series.tensionX = 0.77;

    // bullet is added because we add tooltip to a bullet for it to change color
    var bullet = series.bullets.push(new am4charts.Bullet());
    bullet.tooltipText = "{valueY}";

    bullet.adapter.add("fill", function (fill, target) {
      if (target.dataItem['valueY'] < 0) {
        return am4core.color("#FF0000");
      }
      return fill;
    })
    var rangeNegative = valueAxis.createSeriesRange(series);
    rangeNegative.value = 0;
    rangeNegative.endValue = -100000;
    rangeNegative.contents.stroke = am4core.color("#FF0000");
    rangeNegative.contents.fill = rangeNegative.contents.stroke;

    // Add scrollbar
    var scrollbarX = new am4charts.XYChartScrollbar();
    scrollbarX.series.push(series);
    this.chart.scrollbarX = scrollbarX;

    this.chart.cursor = new am4charts.XYCursor();
  }
}
