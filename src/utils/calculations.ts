export const calculations = {
  calculateVAT: (amount: number, vatRate: number): number => {
    return Math.round((amount * vatRate) * 100) / 100;
  },

  calculateTotalWithVAT: (subtotal: number, vatRate: number): number => {
    const vatAmount = calculations.calculateVAT(subtotal, vatRate);
    return Math.round((subtotal + vatAmount) * 100) / 100;
  },

  calculateSubtotalFromTotal: (total: number, vatRate: number): number => {
    return Math.round((total / (1 + vatRate)) * 100) / 100;
  },

  calculateDiscount: (amount: number, discountRate: number): number => {
    return Math.round((amount * discountRate) * 100) / 100;
  },

  calculateAmountAfterDiscount: (amount: number, discountRate: number): number => {
    const discount = calculations.calculateDiscount(amount, discountRate);
    return Math.round((amount - discount) * 100) / 100;
  },

  calculateProfitMargin: (sellingPrice: number, costPrice: number): number => {
    if (costPrice === 0) return 0;
    return Math.round(((sellingPrice - costPrice) / costPrice) * 100 * 100) / 100;
  },

  calculateProfitAmount: (sellingPrice: number, costPrice: number): number => {
    return Math.round((sellingPrice - costPrice) * 100) / 100;
  },

  calculateMarkup: (sellingPrice: number, costPrice: number): number => {
    if (costPrice === 0) return 0;
    return Math.round(((sellingPrice - costPrice) / sellingPrice) * 100 * 100) / 100;
  },

  calculateInvoiceTotals: (items: Array<{ quantity: number; unitPrice: number }>, vatRate: number = 0.20): {
    subtotal: number;
    vat: number;
    total: number;
  } => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vat = calculations.calculateVAT(subtotal, vatRate);
    const total = subtotal + vat;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  },

  calculateInventoryValue: (items: Array<{ quantity: number; cost: number }>): number => {
    return items.reduce((total, item) => total + (item.quantity * item.cost), 0);
  },

  calculateAverageCost: (items: Array<{ cost: number }>): number => {
    if (items.length === 0) return 0;
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    return Math.round((totalCost / items.length) * 100) / 100;
  },

  calculateWeightedAverageCost: (items: Array<{ quantity: number; cost: number }>): number => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity === 0) return 0;
    
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    return Math.round((totalValue / totalQuantity) * 100) / 100;
  },

  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatPercentage: (value: number, decimals: number = 2): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  roundToDecimals: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  calculateCompoundInterest: (principal: number, rate: number, time: number, compoundFrequency: number = 1): number => {
    return principal * Math.pow(1 + (rate / compoundFrequency), compoundFrequency * time);
  },

  calculateSimpleInterest: (principal: number, rate: number, time: number): number => {
    return principal * rate * time;
  },

  calculatePaymentAmount: (principal: number, rate: number, periods: number): number => {
    if (rate === 0) return principal / periods;
    const monthlyRate = rate / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / (Math.pow(1 + monthlyRate, periods) - 1);
  },

  calculateFutureValue: (presentValue: number, rate: number, periods: number): number => {
    return presentValue * Math.pow(1 + rate, periods);
  },

  calculatePresentValue: (futureValue: number, rate: number, periods: number): number => {
    return futureValue / Math.pow(1 + rate, periods);
  },

  calculateBreakEvenPoint: (fixedCosts: number, variableCostPerUnit: number, sellingPricePerUnit: number): number => {
    if (sellingPricePerUnit <= variableCostPerUnit) return Infinity;
    return Math.ceil(fixedCosts / (sellingPricePerUnit - variableCostPerUnit));
  },

  calculateContributionMargin: (sellingPrice: number, variableCost: number): number => {
    return sellingPrice - variableCost;
  },

  calculateContributionMarginRatio: (sellingPrice: number, variableCost: number): number => {
    if (sellingPrice === 0) return 0;
    return (sellingPrice - variableCost) / sellingPrice;
  }
};

export const VAT_RATES = {
  STANDARD: 0.20,
  REDUCED: 0.05,
  ZERO: 0.00
};

export const TAX_RATES = {
  US: {
    FEDERAL: 0.00,
    STATE: 0.00,
    LOCAL: 0.00
  },
  UK: {
    STANDARD: 0.20,
    REDUCED: 0.05,
    ZERO: 0.00
  },
  EU: {
    STANDARD: 0.20,
    REDUCED: 0.05,
    ZERO: 0.00
  }
};

export const getTaxRate = (region: keyof typeof TAX_RATES, type: keyof typeof TAX_RATES.US): number => {
  return (TAX_RATES[region] as any)[type];
};