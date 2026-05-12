import "dotenv/config";
import express from "express";
import paymentRoutes from "./src/modules/payments/payment.route.js";

const app = express();
app.use("/api/payments", paymentRoutes);

function printRoutes(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(printRoutes.bind(null, path + layer.route.path));
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(printRoutes.bind(null, path + (layer.regexp.source.replace('\\/?$', '').replace('^', ''))));
  } else if (layer.method) {
    console.log(`${layer.method.toUpperCase().padEnd(7)} ${path}`);
  }
}

console.log("🔍 REGISTERED PAYMENT ROUTES:");
app._router.stack.forEach(printRoutes.bind(null, ''));
process.exit(0);
