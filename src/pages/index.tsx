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
        <p>don't forget to <code>be kind🍃</code></p>
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
                      }}><p className="flex justify-center items-center ">Log in <DiscordSvgLogo/></p></button>
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
      <p className="text-xl underline mb-2">Messages from all the guests :</p>
      {guestbookEntries?.map((entry, index) => {
        return <div key={index}><p><span className="italic text-slate-400">{entry.name} - </span>{entry.message}</p></div>
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

const DiscordSvgLogo = ()=>{
  return (
    <div className="text pl-1 pr-1">
      <svg xmlns="http://www.w3.org/2000/svg" height="16" width="20" fill="white" viewBox="0 0 640 512"><path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" /></svg>
    </div>
  )
}