import Prism from 'prismjs'
import { useEffect } from 'react'
import Markdown from 'react-markdown'
import { Message as MessageType } from '../context/AppContext'
import { ClientDate } from './ClientDate'

interface MessageProps {
  message: MessageType
}

const Message = ({ message }: MessageProps) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])
  return (
    <div>
      {message.role === 'user' ? (
        <div className="flex item-start justify-end my-4 p-4 md:p-8 pt-0 pb-0">
          <div className="flex flex-col gap-2 p-3 px-5 bg-gray-200/70 dark:bg-[#2c2c2c] rounded-2xl rounded-tr-sm max-w-2xl">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {message.content}
            </p>
            {/* Timestamp hidden or minimal for user to match Grok clean look, or kept subtle */}
            <ClientDate
              timestamp={message.timestamp}
              format="LT"
              className="text-[10px] text-gray-500 dark:text-gray-400 self-end"
            />
          </div>
          {/* User Icon removed or kept minimal outside bubble? Grok usually minimal. Keeping icon for now as per structure */}
          {/* <img src={assets.user_icon} alt="" className="w-8 rounded-full" /> */}
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 md:p-8 pt-2 pb-2 w-full max-w-3xl mx-auto">
          {/* Bot Message - No Bubble */}
          <div className="flex gap-4">
            {/* Optional: Bot Icon if desired, or just text. Keeping structure simple. */}
            <div className="flex-1 min-w-0">
              {message.isImage ? (
                <img
                  src={message.content}
                  alt=""
                  className="w-full max-w-md mt-2 rounded-lg"
                />
              ) : (
                <div className="text-sm dark:text-gray-200 leading-relaxed reset-tw">
                  <Markdown>{message.content}</Markdown>
                </div>
              )}
              {/* Timestamp for bot */}
              <ClientDate
                timestamp={message.timestamp}
                format="fromNow"
                className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Message
