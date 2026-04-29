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

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  return Response.json(transactions);
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
      title: body.title,
      amount: Number(body.amount),
      type: body.type,
      category: body.category,
      date: body.date ? new Date(body.date) : new Date(),
      userId: user.id,
    },
  });

  return Response.json(transaction);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const transaction = await prisma.transaction.update({
    where: {
      id: body.id,
      userId: user.id,
    },
    data: {
      title: body.title,
      amount: Number(body.amount),
      type: body.type,
      category: body.category,
      date: body.date ? new Date(body.date) : undefined,
    },
  });

  return Response.json(transaction);
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
    return Response.json(
      { error: "Transaction id is required" },
      { status: 400 }
    );
  }

  await prisma.transaction.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  return Response.json({ success: true });
}