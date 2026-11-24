
import HabitsChart from '../components/dashboard/HabitsChart'
import SymptomsChart from '../components/dashboard/SymptomsChart'
import DailyCheckin from '../components/dashboard/DailyCheckin'

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-7">

      <DailyCheckin />

      {/* PAGE HEADER */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-[#789477]">
          TU ESPACIO DE BIENESTAR
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-[#344B3A] sm:text-3xl">
          Mi evolución
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Conocé tus hábitos y seguí la evolución de tus malestares.
        </p>
      </div>

      {/* HABITS */}
      <HabitsChart />

      {/* SYMPTOMS */}
      <SymptomsChart />

      {/* FOOTER */}
      <div className="rounded-2xl bg-[#E6EEE4] p-5">
        <p className="text-sm font-semibold text-[#344B3A]">
          Tu bienestar, un día a la vez.
        </p>

        <p className="mt-1 text-xs leading-relaxed text-[#6D806C]">
          Registrar tus hábitos y malestares te permite conocer mejor
          tu evolución y compartir información útil con tu profesional
          de salud.
        </p>
      </div>

    </div>
  )
}

export default Dashboard
