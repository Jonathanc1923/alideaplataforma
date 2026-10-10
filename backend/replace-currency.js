const fs = require('fs');

const filePath = 'frontend/src/pages/UserWorkspace.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['${(accountingLedger.totalDebe', '{currencySymbol}{(accountingLedger.totalDebe'],
  ['${(accountingLedger.totalHaber', '{currencySymbol}{(accountingLedger.totalHaber'],
  ['${(accountingLedger.diferencia', '{currencySymbol}{(accountingLedger.diferencia'],
  ['Diferencia de Cuadre: ${(accountingLedger.diferencia', 'Diferencia de Cuadre: {currencySymbol}{(accountingLedger.diferencia'],
  ['>${item.amount.toFixed(2)}', '>{currencySymbol}{item.amount.toFixed(2)}'],
  ['>${(acc.totalDebe || 0).toFixed(2)}', '>{currencySymbol}{(acc.totalDebe || 0).toFixed(2)}'],
  ['>${(acc.totalHaber || 0).toFixed(2)}', '>{currencySymbol}{(acc.totalHaber || 0).toFixed(2)}'],
  ['>${(acc.saldo || 0).toFixed(2)}', '>{currencySymbol}{(acc.saldo || 0).toFixed(2)}'],
  ['${(annualBalance.incomeStatement.ventasBrutas', '{currencySymbol}{(annualBalance.incomeStatement.ventasBrutas'],
  ['${(annualBalance.incomeStatement.ventasNetas', '{currencySymbol}{(annualBalance.incomeStatement.ventasNetas'],
  ['${(annualBalance.incomeStatement.utilidadAntesImpuestos', '{currencySymbol}{(annualBalance.incomeStatement.utilidadAntesImpuestos'],
  ['${(annualBalance.incomeStatement.impuestoRenta', '{currencySymbol}{(annualBalance.incomeStatement.impuestoRenta'],
  ['${(annualBalance.incomeStatement.utilidadNetaFinal', '{currencySymbol}{(annualBalance.incomeStatement.utilidadNetaFinal'],
  ['>${(annualBalance.incomeStatement.ventasBrutas || 0).toFixed(2)}', '>{currencySymbol}{(annualBalance.incomeStatement.ventasBrutas || 0).toFixed(2)}'],
  ['>-${(annualBalance.incomeStatement.notasCreditoVentas || 0).toFixed(2)}', '>-{currencySymbol}{(annualBalance.incomeStatement.notasCreditoVentas || 0).toFixed(2)}'],
  ['>+${(annualBalance.incomeStatement.notasDebitoVentas || 0).toFixed(2)}', '>+{currencySymbol}{(annualBalance.incomeStatement.notasDebitoVentas || 0).toFixed(2)}'],
  ['>${(annualBalance.incomeStatement.ventasNetas || 0).toFixed(2)}', '>{currencySymbol}{(annualBalance.incomeStatement.ventasNetas || 0).toFixed(2)}'],
  ['>-${(annualBalance.incomeStatement.egresosOperativos || 0).toFixed(2)}', '>-{currencySymbol}{(annualBalance.incomeStatement.egresosOperativos || 0).toFixed(2)}'],
  ['>${(annualBalance.incomeStatement.utilidadAntesImpuestos || 0).toFixed(2)}', '>{currencySymbol}{(annualBalance.incomeStatement.utilidadAntesImpuestos || 0).toFixed(2)}'],
  ['>-${(annualBalance.incomeStatement.impuestoRenta || 0).toFixed(2)}', '>-{currencySymbol}{(annualBalance.incomeStatement.impuestoRenta || 0).toFixed(2)}'],
  ['>${(annualBalance.incomeStatement.utilidadNetaFinal || 0).toFixed(2)}', '>{currencySymbol}{(annualBalance.incomeStatement.utilidadNetaFinal || 0).toFixed(2)}'],
  ['${(annualBalance.balanceSheet.totalActivos', '{currencySymbol}{(annualBalance.balanceSheet.totalActivos'],
  ['${(annualBalance.balanceSheet.totalPasivos', '{currencySymbol}{(annualBalance.balanceSheet.totalPasivos'],
  ['${(annualBalance.balanceSheet.totalPatrimonio', '{currencySymbol}{(annualBalance.balanceSheet.totalPatrimonio'],
  ['${((annualBalance.balanceSheet.totalPasivos', '{currencySymbol}{((annualBalance.balanceSheet.totalPasivos'],
  ['>${(annualBalance.taxSummary.ivaDebitoFiscal', '>{currencySymbol}{(annualBalance.taxSummary.ivaDebitoFiscal'],
  ['>${(annualBalance.taxSummary.ivaCreditoFiscal', '>{currencySymbol}{(annualBalance.taxSummary.ivaCreditoFiscal'],
  ['${(annualBalance.taxSummary.saldoNetoIva', '{currencySymbol}{(annualBalance.taxSummary.saldoNetoIva'],
  ['${(annualBalance.taxSummary.impuestoRenta', '{currencySymbol}{(annualBalance.taxSummary.impuestoRenta'],
  ['${(e.amount || 0).toFixed(2)}', '{currencySymbol}{(e.amount || 0).toFixed(2)}'],
  ['${(e.tax_amount || 0).toFixed(2)}', '{currencySymbol}{(e.tax_amount || 0).toFixed(2)}'],
  ['${(e.total_amount || 0).toFixed(2)}', '{currencySymbol}{(e.total_amount || 0).toFixed(2)}'],
  ['${m.ingresos.toFixed(2)}', '{currencySymbol}{m.ingresos.toFixed(2)}'],
  ['${m.egresos.toFixed(2)}', '{currencySymbol}{m.egresos.toFixed(2)}'],
  ['${m.utilidad.toFixed(2)}', '{currencySymbol}{m.utilidad.toFixed(2)}'],
  ['${m.impuestos.toFixed(2)}', '{currencySymbol}{m.impuestos.toFixed(2)}'],
  ['>$</span>', '>{currencySymbol}</span>'],
  ['>${parseFloat(entryAmount).toFixed(2)}', '>{currencySymbol}{parseFloat(entryAmount).toFixed(2)}'],
  ['${stage.value.toLocaleString()}', '{currencySymbol}{stage.value.toLocaleString()}'],
  ['${prod.revenue.toFixed(2)}', '{currencySymbol}{prod.revenue.toFixed(2)}'],
  ['${(businessInsights.classificationBreakdown', '{currencySymbol}{(businessInsights.classificationBreakdown'],
  ['-${(businessInsights.classificationBreakdown', '-{currencySymbol}{(businessInsights.classificationBreakdown'],
  ['${(item.ingresos', '{currencySymbol}{(item.ingresos'],
  ['${(item.egresos', '{currencySymbol}{(item.egresos'],
  ['${(item.utilidad', '{currencySymbol}{(item.utilidad'],
  ['${(item.ticketPromedio', '{currencySymbol}{(item.ticketPromedio']
];

for (const [from, to] of replacements) {
  content = content.replaceAll(from, to);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ UserWorkspace.jsx successfully updated with currencySymbol in all tables and metrics!');
