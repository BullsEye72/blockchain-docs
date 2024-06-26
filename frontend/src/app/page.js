import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession();
  console.log({ session });

  return (
    <>
      getServerSession result
      {session?.user?.email ? <div>{session?.user?.email}</div> : <div>Not signed in</div>}
    </>
  );
}
