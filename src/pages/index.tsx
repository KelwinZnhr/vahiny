import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
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
                <div className="pt-5">
                  <Form />
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
    <div className="text-start">
      <p className="text-xl underline mb-2">Messages from all the guest :</p>
      {guestbookEntries?.map((entry, index) => {
        return <div key={index}><p>{entry.message} <span>- {entry.name}</span> </p></div>
      })}
    </div>
  )
}

const Form = ()=>{
  const [message, setMessage] = useState("");
  const { data: session, status} = useSession();

  const utils = api.useContext();
  const postMessage = api.guestbook.postMessage.useMutation({
    onMutate: async (newEntry)=>{
      await utils.guestbook.getAll.cancel();
      utils.guestbook.getAll.setData(undefined, (prevEntries)=>{
        if (prevEntries) {
          return [newEntry, ...prevEntries];
        }else{
          return[newEntry]
        }
      });
    },
    onSettled: async ()=>{
      await utils.guestbook.getAll.invalidate();
    }
  });

  if(status !== "authenticated") return null;

  return(
    <form className="flex gap-2"
    onSubmit={(event)=>{
      event.preventDefault();
      if(session.user.name){
        postMessage.mutate({
          name: session.user.name,
          message:message,
        });
        setMessage("")
      }
    }}>
      <input
        type="text"
        className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
        placeholder="Your message..."
        minLength={2}
        maxLength={100}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
      >
        Submit
      </button>
    </form>
  )
}
