import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"
import Chat from "../components/Chat"

export default function ProtectedPage() {
  const { data: session } = useSession()
  const [content, setContent] = useState()

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display content
  return (
    <Layout>
      <Chat/>
    </Layout>
  )
}
