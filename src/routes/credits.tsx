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
  const [loading, setLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchPlans = async () => {
    setPlans(dummyPlans)
    setLoading(false)
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
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
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
                  className={`border border-gray-200 dark:border-purple-700 rounded-lg p-6 shadow hover:shadow-lg transition-shadow transition-shadow p-6 min-w-[300px] flex flex-col ${
                    plan.name === 'Pro'
                      ? 'bg-purple-50 dark:bg-purple-900'
                      : 'bg-white dark:bg-transparent'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">
                      ${plan.price}
                      <span className="text-base font-normal text-gray-600 ">
                        {}/{plan.credits} credits
                      </span>
                    </p>
                    <ul className="list-disc text-gray-700 dark:text-purple-200 space-y-1 text-sm list-inside">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded cursor-pointer transition-colors">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Credit
