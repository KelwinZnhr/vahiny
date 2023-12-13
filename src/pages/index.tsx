import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";


export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>
  }

  return (
    <>
      <Head>
        <title>Vahiny</title>
        <meta name="description" content="this is a guestbook web app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center">
        <h1 className="text-3xl pt-4">Vahiny</h1>
        <p>don't forget <code>be kind</code></p>
        <div className="pt-10 text-center">
          <div>
            {session ? (
              <>
                <div className="place-items-start">
                  <p className="mb-4 text-center">Hi {session.user?.name}</p>
                  <button
                    
                    className="bg-red-500 p-2 rounded-lg"
                    onClick={() => {
                      signOut().catch(console.log);
                    }}>Logout</button>
                  
                </div>
                <div className="pt-10">
                  <GuestbookEntries />
                </div>
              </>
              ) : (
              <>
                <div className="place-items-center">
                  <p className="mb-4 text-center">Log in to sign on my guestbook 😜</p>
                  <button
                    className="bg-purple-600 p-2 rounded-lg"
                    onClick={() => {
                      signIn("discord").catch(console.log);
                    }}>Log in with Discord</button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

const GuestbookEntries = () => {
  const { data: guestbookEntries, isLoading } = api.guestbook.getAll.useQuery();
  if (isLoading) return <div>Fetching messages</div>;
  return (
    <div>
      {guestbookEntries?.map((entry, index) => {
        return <div key={index}><p>{entry.message} <span>- {entry.name}</span> </p></div>
      })}
    </div>
  )
}

