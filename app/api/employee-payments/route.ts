import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";

const prisma = new PrismaClient();

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await prisma.employeePayment.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return Response.json(payments);
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const transaction = await prisma.transaction.create({
    data: {
      title: `Employee payment - ${body.employeeName}`,
      amount: Number(body.amount),
      type: "expense",
      category: "Employee Payments",
      date: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      userId: user.id,
    },
  });

  const payment = await prisma.employeePayment.create({
    data: {
      employeeName: body.employeeName,
      amount: Number(body.amount),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      note: body.note || null,
      userId: user.id,
      transactionId: transaction.id,
    },
  });

  return Response.json(payment);
}

export async function DELETE(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Payment id is required" }, { status: 400 });
  }

  const payment = await prisma.employeePayment.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!payment) {
    return Response.json({ error: "Payment not found" }, { status: 404 });
  }

  await prisma.employeePayment.delete({
    where: {
      id,
    },
  });

  if (payment.transactionId) {
    await prisma.transaction.deleteMany({
      where: {
        id: payment.transactionId,
        userId: user.id,
      },
    });
  }

  return Response.json({ success: true });
}