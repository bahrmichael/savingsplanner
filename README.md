# Savings Planner for AWS

This tool helps you understand your potential savings with an AWS Savings Plan, based on your previous spending. It was primarily engineered for hobby serverless workloads and therefore does neither provide enterprise EC2 complexity, nor does it provide any official guidance.

## FAQ

Q: Help! I have negative savings!

A: Try lowering your hourly commitment. If you commit to more than you use, you spend more than you would without a savings plan. The app interprets this as overpay and reduces it from your saving. Note that this is an assumption about how savings plans work internally!

Q: How about hourly granularity?

A: Haven't used that yet and therefore have no data. Can definitely be added.

Q: How about multiple regions?

A: Not included, because that would have increased the complexity more than I wanted before launching V1. Should be possible.

Q: Why not pull data from the pricing API?

A: I tried to keep the project lean to launch it quickly.

Q: What about free tiers?

A: As far as I understand, free tiers are applied before the costs show up in the Cost Exporer. Therefore they are included.

Q: I have very complex enterprise payloads that this tool can't handle.

A: duckbillgroup.com can probably help you.

## Inner Workings

Here's how savings are calculated.

1. Get a cost report. This report includes spending per service (e.g. EC2 and Lambda).
2. Define some parameters. The default assumption is the lowest you would get with a savings plan for us-east-1. You can update the parameters based on your preferences.
3. For every day of the cost report, first apply EC2, then Fargate and then Lambda. Apply services spending until you run out of hourly commitment.

## Assumptions

1. The hourly commitment is used up by first applying EC2, then Fargate, then Lambda. Within each, the highest savings rates are applied first.
2. The hourly commitment is used per hour, and if you don't use it up, you spend more than you would without a savings plan.
