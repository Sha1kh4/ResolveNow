export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cfe3df] to-[#d9e3ea] p-6">
      
      {/* Navbar */}
      <div className="flex justify-between items-center mb-10">
        <div className="px-4 py-2 bg-[#d5e8e4] rounded-full text-sm font-semibold tracking-widest text-[#1e6f5c]">
          COMPLAINT MANAGEMENT SYSTEM
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-medium">
            Login
          </button>
          <button className="px-6 py-2 rounded-xl bg-[#1e6f5c] text-white font-medium">
            Register
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 shadow-lg flex gap-10">
        
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            One Platform for <br /> Every Complaint.
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            A streamlined portal for users, faculty, and administrators to manage
            complaints, route them to the right department, and keep resolution
            status transparent from start to finish.
          </p>

          <div className="flex gap-4 mb-8">
            <button className="bg-[#1e6f5c] text-white px-6 py-3 rounded-xl font-medium">
              Create Account
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-xl font-medium text-gray-700">
              Sign In
            </button>
          </div>

          {/* Features */}
          <div className="flex gap-4">
            <div className="bg-white p-5 rounded-2xl shadow w-52">
              <h3 className="font-semibold mb-2">4 Departments</h3>
              <p className="text-sm text-gray-500">
                Behavioural, infrastructural, academic, and general
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow w-52">
              <h3 className="font-semibold mb-2">Round Robin</h3>
              <p className="text-sm text-gray-500">
                Fair faculty assignment across mapped departments
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow w-52">
              <h3 className="font-semibold mb-2">Priority Escalation</h3>
              <p className="text-sm text-gray-500">
                Automatic escalation and admin notification flow
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-[400px]">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#14532d] text-white p-6 rounded-2xl shadow-lg">
            <p className="text-xs tracking-widest text-gray-300 mb-2">
              LIVE WORKFLOW
            </p>

            <h2 className="text-xl font-bold mb-4">
              Complaint → Department → Faculty → Resolution
            </h2>

            <p className="text-sm text-gray-300">
              Keep every complaint visible, assigned, and accountable with
              timestamped actions and role-based access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}