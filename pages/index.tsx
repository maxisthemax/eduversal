import { Button } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { push } = useRouter()
  return (
    <Button
      onClick={async () => {
        axios.post('/api/auth/signOut')
        push('/signin')
      }}
    >
      Sign Out
    </Button>
  )
}
