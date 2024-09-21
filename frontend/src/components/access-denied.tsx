import { signIn } from "next-auth/react"

export default function AccessDenied() {
  return (
    <>
      <div className="h-screen px-[20%] bg-[#171717] text-[#F8F8F8] flex flex-col items-center justify-center space-y-4">
        <div>
          <h1 className="text-[48px] font-black text-center">Smart Chat, Secure Data: Your AI Sidekick for Effortless Forms</h1>
        </div>
        <div>
          <h3>We are required to authenticate your identity please login to continue</h3>
        </div>
        <div>
          <p>
          <button className="bg-[#F8F8F8] text-[#171717] px-4 py-2 rounded-md">
            <a
                href={`/api/auth/signin`}
                onClick={(e) => {
                  e.preventDefault()
                  signIn("worldcoin") // when worldcoin is the only provider
                  // signIn() // when there are multiple providers
                }}
              >
                Continue with World Coin
            </a>
          </button>
          </p>
        </div>
      </div>
    </>
  )
}
