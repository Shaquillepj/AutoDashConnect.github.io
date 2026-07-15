import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { ServiceProvider } from "@shared/schema";
import { useLocation } from "wouter";

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const [, setLocation] = useLocation();

  const handleViewProvider = () => {
    setLocation(`/booking/${provider.id}/service-1`);
  };

  return (
    <div
      className="card-surface overflow-hidden cursor-pointer rounded-2xl group"
      onClick={handleViewProvider}
    >
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
          alt="Professional auto service"
          width={400}
          height={176}
          loading="lazy"
          decoding="async"
          className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="text-[10px] font-semibold bg-white/90 text-zinc-900 border-0 shadow-sm px-2.5 py-0.5">
            Mobile Service
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-sm font-bold text-foreground leading-tight">{provider.businessName}</h3>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-foreground">{provider.rating}</span>
            <span className="text-xs text-muted-foreground">({provider.reviewCount})</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{provider.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{provider.serviceRadius} mi radius</span>
          </div>
          <span className="text-xs font-semibold" style={{ color: "hsl(142 60% 35%)" }}>
            ● Available
          </span>
        </div>

        <Button
          className="w-full h-9 text-sm font-semibold rounded-xl bg-electric text-white hover:bg-electric-dim"
          style={{ boxShadow: "var(--shadow-glow)" }}
          onClick={(e) => { e.stopPropagation(); handleViewProvider(); }}
        >
          View Services
        </Button>
      </div>
    </div>
  );
}
