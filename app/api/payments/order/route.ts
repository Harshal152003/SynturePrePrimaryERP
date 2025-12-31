// app/api/payments/order/route.ts
import { NextResponse } from "next/server";
import rzp from "@/lib/razorpay";

export async function POST(req: Request) {
  const { amount, currency="INR", receipt } = await req.json();
  const opts = { amount: Math.round(amount*100), currency, receipt };
  const order = await rzp.orders.create(opts);
  return NextResponse.json({ success: true, order });
}
