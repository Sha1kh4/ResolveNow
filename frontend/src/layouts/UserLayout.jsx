import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const UserLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default UserLayout;