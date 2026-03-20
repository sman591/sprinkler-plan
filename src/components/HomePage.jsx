import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const onGetStarted = () => navigate('/app')
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-lg font-semibold tracking-tight">Sprinkler Plan</span>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="text-5xl mb-6">💧</div>
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4">
          Plan your irrigation system with confidence
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          Upload a photo of your yard, place your sprinkler heads, and build a coverage map to
          see exactly what each head waters. Set a weekly watering goal and fine-tune head positions until
          every inch of lawn gets what it needs.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-lg"
        >
          Start planning free
        </button>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 bg-slate-800/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">
          <Feature
            icon="🗺️"
            title="Visual layout"
            body="Place heads directly on your yard photo and build an irrigation map with coverage arcs drawn to scale."
          />
          <Feature
            icon="📐"
            title="True-to-scale"
            body="Calibrate using any two points with a known distance. Every measurement reflects your actual yard."
          />
          <Feature
            icon="💧"
            title="Plan around your water goal"
            body="Set a weekly watering target — like 1 inch per week — then adjust head placement and zone run times until every zone hits it."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <ol className="space-y-8">
            <Step n="1" title="Upload a yard photo">
              Any aerial or top-down photo works — a Google Maps screenshot is perfect.
            </Step>
            <Step n="2" title="Set the scale">
              Click two points on the image and enter the real-world distance between them.
            </Step>
            <Step n="3" title="Place sprinkler heads">
              Add heads, assign zones, and adjust radius and arc angle to match your hardware.
            </Step>
            <Step n="4" title="Dial in your coverage">
              Set a weekly watering goal, then tune zone run times and head positions until
              the coverage map shows every area is hitting its target.
            </Step>
          </ol>
          <div className="text-center mt-14">
            <button
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl text-lg"
            >
              Try it now — no account needed
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Sprinkler Plan
      </footer>

    </div>
  )
}

function Feature({ icon, title, body }) {
  return (
    <div className="px-8 py-10 flex flex-col gap-3">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <li className="flex gap-5 items-start">
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
        {n}
      </span>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{children}</p>
      </div>
    </li>
  )
}
