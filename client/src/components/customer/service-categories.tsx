import { Car, Wrench, Settings, Zap } from "lucide-react";

const categories = [
  {
    icon: Car,
    name: "Auto Detailing",
    description: "Interior & exterior",
    iconBg: "hsl(204 70% 53% / 0.10)",
    iconColor: "hsl(204 70% 40%)",
  },
  {
    icon: Wrench,
    name: "Oil Change",
    description: "Quick & professional",
    iconBg: "hsl(142 60% 40% / 0.10)",
    iconColor: "hsl(142 60% 35%)",
  },
  {
    icon: Settings,
    name: "Brake Service",
    description: "Safety & repair",
    iconBg: "hsl(0 65% 50% / 0.10)",
    iconColor: "hsl(0 65% 45%)",
  },
  {
    icon: Zap,
    name: "Battery",
    description: "Test & replace",
    iconBg: "hsl(43 89% 52% / 0.10)",
    iconColor: "hsl(43 80% 38%)",
  },
];

export function ServiceCategories() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-4">Popular Services</h2>
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.name}
              className="tile flex flex-col items-center gap-2 py-4 px-2 rounded-2xl text-center group"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: category.iconBg }}
              >
                <Icon className="w-5 h-5" style={{ color: category.iconColor }} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs leading-tight">{category.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{category.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
