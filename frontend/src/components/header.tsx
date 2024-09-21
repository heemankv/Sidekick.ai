import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <header className="bg-white mx-6 border rounded-md">
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <nav className="bg-[#171717] py-3 px-10 border-b border-[#f8f8f8] flex flex-row justify-between items-center">
        <div className="text-[#f8f8f8] text-[16px]">
          <h2>Sidekick.ai</h2>
        </div>
        <div>
          <p>
            {!session && (
              <>
                <button className="bg-[#F8F8F8] text-[#171717] px-4 py-2 rounded-md">
                  <a
                    href={`/api/auth/signin`}
                    onClick={(e) => {
                      e.preventDefault()
                      signIn("worldcoin") // when worldcoin is the only provider
                      // signIn() // when there are multiple providers
                    }}
                  >
                    Sign in
                  </a>
                </button>
              </>
            )}
            {session?.user && (
              <>
                {session.user.image && (
                  <span
                    style={{ backgroundImage: `url('${session.user.image}')` }}
                  />
                )}
                <span >
                  <small>Signed in as</small>
                  <br />
                  <strong>{session.user.email ?? session.user.name}</strong>
                </span>
                <a
                  href={`/api/auth/signout`}
                  onClick={(e) => {
                    e.preventDefault()
                    signOut()
                  }}
                >
                  Sign out
                </a>
              </>
            )}
          </p>
        </div>
      </nav>
    </header>
  )
}
