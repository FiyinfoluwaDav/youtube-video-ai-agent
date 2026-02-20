import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { dummyPlans } from '../components/chatbot UI/assets/assets'

export const Route = createFileRoute('/credits')({
  component: Credit,
})

interface Plan {
  _id: string
  name: string
  price: number
  credits: number
  features: string[]
}

import { assets } from '@/components/chatbot UI/assets/assets'
import Sidebar from '@/components/chatbot UI/components/Sidebar'

function Credit() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchPlans = async () => {
    setPlans(dummyPlans)
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <>
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          alt=""
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden invert dark:invert-0"
          onClick={() => setIsMenuOpen(true)}
        />
      )}
      <div className="flex h-screen bg-gray-50 dark:bg-[#000000] text-slate-900 dark:text-white overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A0000] rounded-full blur-[120px] opacity-0 dark:opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1A0000] rounded-full blur-[120px] opacity-0 dark:opacity-50"></div>
        </div>

        <div className="relative z-10 flex w-full h-full">
          <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white">
                Credit Plans
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`border rounded-lg shadow hover:shadow-lg transition-all duration-300 p-6 min-w-[300px] flex flex-col ${
                      plan.name === 'Pro'
                        ? 'bg-orange-50 dark:bg-[#1A0000]/80 border-[#FF4500] dark:shadow-[0_0_30px_-5px_usr(#FF4500,0.3)]'
                        : 'bg-white dark:bg-[#111111]/80 border-gray-200 dark:border-white/10'
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-2xl font-bold mb-4 flex items-baseline gap-1">
                        <span className="text-[#FF4500] dark:text-[#FF4500]">
                          ${plan.price}
                        </span>
                        <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                          /{plan.credits} credits
                        </span>
                      </p>
                      <ul className="list-disc space-y-1 text-sm list-inside text-gray-700 dark:text-gray-300">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="marker:text-[#FF4500]">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="mt-6 bg-[#FF4500] hover:bg-[#FF6B00] active:bg-[#E63900] text-white font-medium py-2 rounded cursor-pointer transition-colors shadow-[0_0_15px_-3px_rgba(255,69,0,0.4)]">
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Credit
