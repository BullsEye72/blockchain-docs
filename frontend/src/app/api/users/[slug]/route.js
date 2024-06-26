import { NextRequest, NextResponse } from "next/server";

export async function GET(request, { params }) {
  const slug = params.slug; // user id

  try {
    const { rows } = `select * from account where id = ${slug}`;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
