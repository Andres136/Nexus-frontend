import PropTypes from "prop-types";

export default function ConfiguracionNominaTabs({
  configTabs,
  activeConfigTab,
  setActiveConfigTab,
}) {
  return (
    <div className="mb-5 overflow-x-auto rounded-xl border border-gray-200 bg-white px-2 py-2 shadow-sm">
      <div className="flex min-w-max gap-1">
        {configTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeConfigTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveConfigTab(tab.id)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

ConfiguracionNominaTabs.propTypes = {
  configTabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  activeConfigTab: PropTypes.string.isRequired,
  setActiveConfigTab: PropTypes.func.isRequired,
};
