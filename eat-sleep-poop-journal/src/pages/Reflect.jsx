import { format } from 'date-fns'
import ReflectionForm from '../components/reflection/ReflectionForm'
import AvoidanceList from '../components/reflection/AvoidanceList'

export default function Reflect() {
  const dateStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-5 pt-14 pb-4 shadow-sm">
        <h1 className="text-2xl font-bold">Reflect</h1>
        <p className="text-gray-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28 pt-4 space-y-4">
        <ReflectionForm date={dateStr} />
        <AvoidanceList date={dateStr} />
      </div>
    </div>
  )
}
