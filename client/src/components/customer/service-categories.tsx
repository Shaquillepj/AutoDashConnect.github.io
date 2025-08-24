import { Card, CardContent } from "@/components/ui/card";
import { Car, Wrench, Settings, Zap } from "lucide-react";

const categories = [
  {
    icon: Car,
    name: "Auto Detailing",
    description: "Interior & exterior cleaning",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Wrench,
    name: "Oil Change",
    description: "Quick & professional service",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: Settings,
    name: "Brake Service",
    description: "Safety inspection & repair",
    color: "bg-red-100 text-red-600"
  },
  {
    icon: Zap,
    name: "Battery Service",
    description: "Testing & replacement",
    color: "bg-yellow-100 text-yellow-600"
  }
];

export function ServiceCategories() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Services</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
