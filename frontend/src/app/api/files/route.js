// import { sql } from "@vercel/postgres";
// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";

// export async function GET(request, { params }) {
//   const session = await getServerSession();

//   if (!session) {
//     // If the user is not logged in, return an error
//     return NextResponse.json({ error: "You need to be logged in" }, { status: 401 });
//   }

//   try {
//     const { rows } = await sql`
//     select file.name, users.email, file.hash from file
//     left join users on users.id = file.id_user
//     where users.email = ${session.user.email}
//     `;

//     return NextResponse.json(rows);
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// export async function POST(request, { params }) {
//   const body = await request.json();

//   const { id_user, hash, name, transaction_hash } = body;
//   console.log("Id_user:", id_user, "hash:", hash, "name:", name, "transaction_hash:", transaction_hash);

//   if (!id_user || !hash || !name || !transaction_hash) {
//     return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
//   }

//   let db;
//   try {
//     const {
//       rows,
//     } = await sql`insert into file (name, hash, transaction_hash, id_user) values (${name}, ${hash}, ${transaction_hash} , ${id_user})`;

//     console.log("Data inserted successfully");
//     return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Database error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
