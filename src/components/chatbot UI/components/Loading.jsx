import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const Loading = () => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      ;<Link to="/"></Link>
    }, 8000)
  }, [])
  return (
    <div className="bg-gradient-to-b from -[#531B81] to-[#29184B] backdrop-opacity-60 flex item-center justify-center h-screen w-screen text-white text-2xl">
      <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default Loading
