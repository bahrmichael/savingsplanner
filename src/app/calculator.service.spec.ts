import { TestBed } from '@angular/core/testing';

import { CalculatorService } from './calculator.service';
import { EPERM } from 'constants';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle empty data', () => {
    const rows: string[] = [];
    const result = service.calc(rows, null, null)
    expect(result.length).toBe(0);
  });

  it('should handle a few entries with no savings rate', () => {
    const rows: string[] = ["Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,0,24,0",
      "2019-05-02,0,24,0",
      "2019-05-03,0,24,0",];
    const result = service.calc(rows, 1, {ec2: [{instanceType: 't3.micro', savingsRate: 0}], lambda: 0, fargate: 0})
    expect(result.length).toBe(3);
    result.forEach((entry) => {
      expect(entry.value).toBe(0);
    });
  });

  it('should handle a few entries with max ec2 savings rate', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,0,24,0",
      "2019-05-02,0,24,0",
      "2019-05-03,0,24,0",];
    const result = service.calc(rows, 1, {ec2: [{instanceType: 't3.micro', savingsRate: 100}]})
    expect(result.length).toBe(3);

    // the values are cumulative
    expect(result[0].value).toBe(24);
    expect(result[1].value).toBe(2 * 24);
    expect(result[2].value).toBe(3 * 24);
  });

  it('should handle a few entries with 50% ec2 savings rate', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,0,24,0",
      "2019-05-02,0,24,0",
      "2019-05-03,0,24,0",];
    const result = service.calc(rows, 1, {ec2: [{instanceType: 't3.micro', savingsRate: 50}]})
    expect(result.length).toBe(3);

    // the values are cumulative
    expect(result[0].value).toBe(12);
    expect(result[1].value).toBe(2 * 12);
    expect(result[2].value).toBe(3 * 12);
  });

  it('should handle a few entries with varying rates A', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const result = service.calc(rows, 2, {ec2: [{instanceType: 't3.micro', savingsRate: 50}], lambda: 50})
    expect(result.length).toBe(3);

    // the values are cumulative
    expect(result[0].value).toBe(12 * 2);
    expect(result[1].value).toBe(2 * 12 * 2);
    expect(result[2].value).toBe(3 * 12 * 2);
  });

  it('should handle a few entries with varying rates B', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const result = service.calc(rows, 1, {ec2: [{instanceType: 't3.micro', savingsRate: 50}], lambda: 50})
    expect(result.length).toBe(3);

    // the values are cumulative
    expect(result[0].value).toBe(12);
    expect(result[1].value).toBe(2 * 12);
    expect(result[2].value).toBe(3 * 12);
  });

  it('should handle a few entries with varying rates C', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const result = service.calc(rows, 2, {ec2: [{instanceType: 't3.micro', savingsRate: 50}], lambda: 20})
    expect(result.length).toBe(3);

    // the values are cumulative
    expect(result[0].value).toBe(24 / 2 + 24 / 5);
    expect(result[1].value).toBe(2 * (24 / 2 + 24 / 5));
    expect(result[2].value).toBe(3 * (24 / 2 + 24 / 5));
  });

  it('should handle a few entries with varying spending A', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,0,24,0",
      "2019-05-03,24,0,0",];
    const result = service.calc(rows, 2, {ec2: [{instanceType: 't3.micro', savingsRate: 50}], lambda: 20})
    expect(result.length).toBe(3);

    // the values are cumulative; reduction due to overpay
    expect(result[0].value).toBe(24 / 2 + 24 / 5);
    expect(result[1].value).toBe((24 / 2 + 24 / 5) + (24 / 2) - 24);
    expect(result[2].value).toBe((24 / 2 + 24 / 5) + (24 / 2) + (24 / 5) - 24 - 24);
  });

  it('should get indices scenario A', () => {
    const services: string[] = "Service,Lambda($),EC2-Instances($),Total cost ($)".split(',');
    const result = service.getIndices(services);
    
    expect(result.ec2).toBe(2);
    expect(result.lambda).toBe(1);
  });

  it('should get indices scenario B', () => {
    const services: string[] = "Service,EC2 Container Service($),Savings Plans for  Compute usage($),Tax($),Lambda($),DynamoDB($),CloudWatch($),EC2-Instances($),CloudFront($),API Gateway($),S3($),Route 53($),SQS($),Step Functions($),EC2-Other($),Data Pipeline($),SNS($),Key Management Service($),Cost Explorer($),EC2 Container Registry (ECR)($),Budgets($),CloudTrail($),Total cost ($)".split(',');
    const result = service.getIndices(services);
    
    expect(result.ec2).toBe(7);
    expect(result.lambda).toBe(4);
    expect(result.fargate).toBe(1);
  });

  it('should get spending' , () => {
    const cells = ["2019-05-03", "72", "120", "264"];
    const indices = {
      lambda: 1,
      ec2: 2,
      fargate: 3
    };

    const result = service.getSpendings(cells, indices);
    expect(result.ec2).toBe(5);
    expect(result.lambda).toBe(3);
    expect(result.fargate).toBe(11);
  });


  it('should get instance spending without distribution' , () => {
    const result = service.getInstanceSpending("t3.micro", 24);
    expect(result).toBe(24);
  });

  it('should get instance spending with distribution' , () => {
    const distribution = {
      't3.micro': 100
    }
    const result = service.getInstanceSpending("t3.micro", 24, distribution, ['t3.micro']);
    expect(result).toBe(24);
    
  });

  it('should get savings with 0 rate', () => {
    const result = service.getSavings(1, 0);
    expect(result).toBe(0);
  });

  it('should get savings with 50 rate', () => {
    const result = service.getSavings(1, 50);
    expect(result).toBe(12);
  });

  it('should get savings with 100 rate', () => {
    const result = service.getSavings(1, 100);
    expect(result).toBe(24);
  });

  it('should get remaining savings with 0', () => {
    const result = service.getRemainingSavings(0, 100, 1);
    expect(result).toBe(0);
  });

  it('should get remaining savings with equal remaining commitment', () => {
    const result = service.getRemainingSavings(1, 100, 1);
    expect(result).toBe(24);
  });

  it('should get remaining savings with lower remaining commitment', () => {
    const result = service.getRemainingSavings(1, 100, 0.5);
    expect(result).toBe(12);
  });

  it('should get remaining savings with higher remaining commitment', () => {
    const result = service.getRemainingSavings(1, 100, 2);
    expect(result).toBe(24);
  });


  it('should calc row with full ec2', () => {
    const spending = {
      ec2: 1
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ]
    }
    const result = service.calcRow(1, spending, rates);
    expect(result.ec2).toBe(24);
    expect(result.overpay).toBe(0)
  });

  it('should calc row with full ec2 at 50 rate', () => {
    const spending = {
      ec2: 1
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 50
        }
      ]
    }
    const result = service.calcRow(1, spending, rates);
    expect(result.ec2).toBe(12);
    expect(result.overpay).toBe(0)
  });

  it('should calc row with half ec2', () => {
    const spending = {
      ec2: 1
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ]
    }
    const result = service.calcRow(2, spending, rates);
    expect(result.ec2).toBe(24);
    expect(result.overpay).toBe(24)
  });

  it('should calc row with double ec2', () => {
    const spending = {
      ec2: 2
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ]
    }
    const result = service.calcRow(1, spending, rates);
    expect(result.ec2).toBe(24);
    expect(result.overpay).toBe(0)
  });

  it('should calc row with all services used up', () => {
    const spending = {
      ec2: 1,
      fargate: 1,
      lambda: 1,
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ],
      lambda: 100,
      fargate: 100
    }
    const result = service.calcRow(3, spending, rates);
    expect(result.ec2).toBe(24);
    expect(result.lambda).toBe(24);
    expect(result.fargate).toBe(24);
    expect(result.overpay).toBe(0);
  });

  it('should calc row with all services partially used', () => {
    const spending = {
      ec2: 0.5,
      fargate: 0.5,
      lambda: 0.5,
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ],
      lambda: 100,
      fargate: 100
    }
    const result = service.calcRow(3, spending, rates);
    expect(result.ec2).toBe(12);
    expect(result.lambda).toBe(12);
    expect(result.fargate).toBe(12);
    expect(result.overpay).toBe(3 * 12);
  });

  it('should calc row with differing usage', () => {
    const spending = {
      ec2: 1,
      fargate: 3,
      lambda: 2,
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ],
      lambda: 100,
      fargate: 100
    }
    const result = service.calcRow(6, spending, rates);
    expect(result.ec2).toBe(24);
    expect(result.lambda).toBe(2*24);
    expect(result.fargate).toBe(3*24);
    expect(result.overpay).toBe(0);
  });

  it('should calc row with differing rates', () => {
    const spending = {
      ec2: 1,
      fargate: 4,
      lambda: 2,
    }
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        }
      ],
      lambda: 50,
      fargate: 50
    }
    const result = service.calcRow(6, spending, rates);
    expect(result.ec2).toBe(1 * 24 * 1);
    expect(result.fargate).toBe(4 * 24 * 0.5);
    expect(result.lambda).toBe(1 * 24 * 0.5); // there is only 1 dollar left for lambda to use
    expect(result.overpay).toBe(0);
  });

  it('should factor in multiple ec2 spendings', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 100
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge'];
    const distribution = [12, 12];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(24);
  });

  it('should factor in multiple ec2 spendings', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 50
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge'];
    const distribution = [12, 12];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(12 + 6);
  });

  it('should factor in multiple ec2 spendings', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 0
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 50
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge'];
    const distribution = [12, 12];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(6);
  });

  it('should factor in multiple ec2 spendings', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 0
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 0
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge'];
    const distribution = [12, 12];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(0);
  });

  it('should factor in multiple ec2 spendings with surplus instances', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 0
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 0
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const distribution = [12, 12];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(0);
  });

  it('should factor in multiple ec2 spendings with surplus spending', () => {
    const spending = {
      ec2: 1
    };
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 0
        }
      ]
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const distribution = [12, 0, 12, 24];
    const result = service.calcRow(1, spending, rates, distribution, instanceTypes);

    expect(result.ec2).toBe(12);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 100
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12],
      '2019-05-02': [12, 12],
      '2019-05-03': [12, 12],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(24);
    expect(result[1].value).toBe(2 * 24);
    expect(result[2].value).toBe(3 * 24);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 100
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 100
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12, 0, 0],
      '2019-05-02': [24, 0, 0, 0],
      '2019-05-03': [0, 24, 0, 0],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(24);
    expect(result[1].value).toBe(2 * 24);
    expect(result[2].value).toBe(3 * 24);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 50
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 50
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12, 0, 0],
      '2019-05-02': [24, 0, 0, 0],
      '2019-05-03': [0, 24, 0, 0],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(12);
    expect(result[1].value).toBe(2 * 12);
    expect(result[2].value).toBe(3 * 12);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 50
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 100
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12, 0, 0],
      '2019-05-02': [24, 0, 0, 0],
      '2019-05-03': [0, 24, 0, 0],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(6 + 12);
    expect(result[1].value).toBe(6 + 12 + 12);
    expect(result[2].value).toBe(6 + 12 + 12 + 24);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 0
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 0
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12, 0, 0],
      '2019-05-02': [24, 0, 0, 0],
      '2019-05-03': [0, 24, 0, 0],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(0);
    expect(result[1].value).toBe(0);
    expect(result[2].value).toBe(0);
  });

  it('should do big calculation with all different factors', () => {
    const rows: string[] = [
      "Service,Lambda($),EC2-Instances($),Total cost ($)",
      "Service Total,257,144.17285671270017,401",
      "2019-05-01,24,24,0",
      "2019-05-02,24,24,0",
      "2019-05-03,24,24,0",];
    const rates = {
      ec2: [
        {
          instanceType: 't3.micro',
          savingsRate: 0
        },
        {
          instanceType: 'r4.2xlarge',
          savingsRate: 50
        }
      ]
    };
    const distribution = {
      '2019-05-01': [12, 12, 0, 0],
      '2019-05-02': [24, 0, 0, 0],
      '2019-05-03': [0, 24, 0, 0],
    };
    const instanceTypes = ['t3.micro', 'r4.2xlarge', 'l2.large'];
    const result = service.calc(rows, 1, rates, distribution, instanceTypes);

    expect(result[0].value).toBe(6);
    expect(result[1].value).toBe(6);
    expect(result[2].value).toBe(6 + 12);
  });
  
});
