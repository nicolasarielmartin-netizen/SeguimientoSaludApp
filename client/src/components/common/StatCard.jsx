
const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'green'
}) => {
  const colorStyles = {
    green: 'bg-[#E6EEE4] text-[#42634C]',
    beige: 'bg-[#F5F0E6] text-[#766B58]',
    orange: 'bg-[#F8E9DF] text-[#A66A49]',
    blue: 'bg-[#E5EFED] text-[#527C75]'
  }

  return (
    <div className="rounded-2xl border border-[#E9E9E0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-[#344B3A]">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`rounded-xl p-3 ${colorStyles[color]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {description}
      </p>
    </div>
  )
}

export default StatCard
