import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { Revenue } from '@/app/lib/definitions';
export default function RevenueChart({
  revenue,
}: {
  revenue: Revenue[];
}) {
  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(revenue);

  if (!revenue || revenue.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    <div className="md:col-span-2">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Recent Revenue
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex gap-4">
          {/* Y Axis - ADDED mb-6 to align $0K with the bars instead of the text */}
          <div
            className="hidden sm:flex flex-col justify-between text-sm text-gray-400 mb-6" 
            style={{ height: chartHeight }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {/* Bars container */}
          <div
            className="flex flex-1 items-end gap-3"
            style={{ height: chartHeight }}
          >
            {revenue.map((month) => (
              <div
                key={month.month}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-6 rounded-md bg-blue-300"
                  style={{
                    height: `${(month.revenue / topLabel) * chartHeight}px`,
                  }}
                />
                <p className="text-xs text-gray-400">{month.month}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center text-gray-500">
          <CalendarIcon className="h-5 w-5" />
          <span className="ml-2 text-sm">Last 12 months</span>
        </div>
      </div>
    </div>
  );
}