# Open Solver Simulator

A modern, open source web application for interactive optimization and planning, inspired by Meta, Twitter, and Google Material Design.  
Includes two tools:
- **Financial Planning Optimizer:** Calculate the monthly investment needed to reach your financial goal.
- **Product Mix Optimization:** Optimize production quantities for maximum profit given multiple resources and constraints.

## Features

- Beautiful, responsive Material-inspired UI
- Dynamic forms for both financial and product mix optimization
- Add/remove resources and products with a single click
- Linear programming solver integration (via [javascript-lp-solver](https://github.com/JWally/jsLPSolver))
- Usage notes and clear input validation

## Quick Start

1. **Clone or download this repository**
2. **Open `index.html` in any modern browser** (no build step required!)

## File Structure

```text
.
├── index.html         # App HTML entry point
├── styles.css         # Global Material-inspired styles and layout
├── app.js             # Interactive logic for both tools
└── README.md          # This file
```

## How to Use

### Financial Planning Optimizer
- Enter your target amount (goal), years, expected annual return (%), and initial investment (all amounts in **euros**).
- Click **Optimize Plan**.
- Instantly see the monthly investment needed to hit your goal, with clear, styled results.

### Product Mix Optimization
- Add up to 5 resources (e.g. machines, labor types, raw materials) and specify their available stock.
- Add products. For each product:
    - Enter product name and profit per unit (in **euros**)
    - Enter, for each resource, how much is used per unit produced
- Click **Optimize Mix**. The tool calculates (using linear programming) the optimal production plan for maximum profit, subject to all constraints.

## Screenshots

![Financial Planning Optimizer UI](./screenshot_financial.png)
![Product Mix Optimization UI](./screenshot_productmix.png)

## Credits

- JavaScript LP Solver: [JWally/jsLPSolver](https://github.com/JWally/jsLPSolver)
- Design inspired by Google Material, Meta, and Twitter web products

## License

MIT
