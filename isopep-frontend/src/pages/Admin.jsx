//  Page Admin (src/pages/Admin.jsx)
export default function AdminPage() {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">🛠️ Admin Panel</h2>
        <p className="text-gray-700 mb-4">
          Use this interface to run admin-only actions such as syncing with ERP, clearing memory state, or toggling contract states.
        </p>
        <TestButton />
      </div>
    );
  }
  