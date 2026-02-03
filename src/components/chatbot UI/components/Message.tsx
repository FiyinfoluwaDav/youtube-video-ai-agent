import moment from 'moment'
import { assets } from '../assets/assets'
import { Message as MessageType } from '../context/AppContext'

interface MessageProps {
  message: MessageType
}

const Message = ({ message }: MessageProps) => {
  return (
    <div>
      {message.role === 'user' ? (
        <div className="flex item-start justify-end my-4-2 p-8">
          <div className="flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border=[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-gray-200">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img src={assets.user_icon} alt="" className="w-8 rounded-full" />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30 border border=[#80609F]/30 rounded-md max-w-2xl">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div className="text-sm dark:text-gray-200 reset-tw">
              {message.content}
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-[#B1A6C0]">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  )
}

export default Message
