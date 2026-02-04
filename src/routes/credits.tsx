import { useEffect, useState } from 'react'
import { dummyPlans } from '../components/chatbot UI/assets/assets'

interface Plan {
  _id: string
  name: string
  price: number
  credits: number
  features: string[]
}

const Credit = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPlans = async () => {
    setPlans(dummyPlans)
    setLoading(false)
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Credit
