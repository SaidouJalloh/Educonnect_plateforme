import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import OpportunityCard from "@/components/OpportunityCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import type { Opportunity } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 9;

// Fallback data when API is unavailable
const fallbackOpportunities = [
  {
    id: 1,
    titre: "Bourse d'Excellence Africaine 2025",
    description: "Programme de bourses complètes pour études supérieures en sciences et technologies.",
    type: "Bourse",
    pays: "Plusieurs pays",
    date_limite: "30 Mars 2025",
    lien: "#",
  },
  {
    id: 2,
    titre: "Formation en Data Science - Google Africa",
    description: "Formation gratuite en analyse de données et intelligence artificielle.",
    type: "Formation",
    pays: "En ligne",
    date_limite: "15 Avril 2025",
    lien: "#",
  },
  {
    id: 3,
    titre: "Stage International - Banque Africaine",
    description: "Opportunité de stage de 6 mois dans le secteur bancaire et financier.",
    type: "Stage",
    pays: "Abidjan, Côte d'Ivoire",
    date_limite: "20 Février 2025",
    lien: "#",
  },
  {
    id: 4,
    titre: "Programme d'Échange Universitaire",
    description: "Échanges académiques entre universités africaines pour élargir vos horizons.",
    type: "Échange",
    pays: "Afrique de l'Ouest",
    date_limite: "10 Mai 2025",
    lien: "#",
  },
  {
    id: 5,
    titre: "Bourse Master en Ingénierie",
    description: "Financement complet pour Master en génie civil et architecture.",
    type: "Bourse",
    pays: "Dakar, Sénégal",
    date_limite: "25 Mars 2025",
    lien: "#",
  },
  {
    id: 6,
    titre: "Formation Entrepreneuriat Digital",
    description: "Programme intensif pour jeunes entrepreneurs africains dans le numérique.",
    type: "Formation",
    pays: "Lagos, Nigeria",
    date_limite: "5 Avril 2025",
    lien: "#",
  },
];

const Opportunities = () => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadOpportunities = useCallback((showRefreshToast = false) => {
    setError(null);
    if (showRefreshToast) setIsRefreshing(true);
    else setLoading(true);

    const data = fallbackOpportunities.map((opp) => ({ ...opp, niveau: undefined }));
    setOpportunities(data);
    setFilteredOpportunities(data);
    setUsingFallback(false);

    if (showRefreshToast) {
      toast({ title: "Actualisé", description: "Les opportunités ont été mises à jour." });
    }

    setLoading(false);
    setIsRefreshing(false);
  }, [toast]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const handleFilter = useCallback(() => {
    let filtered = opportunities;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.titre.toLowerCase().includes(query) ||
          opp.description.toLowerCase().includes(query) ||
          opp.pays?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (opp) => opp.type.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredOpportunities(filtered);
    setCurrentPage(1);
  }, [opportunities, searchQuery, selectedCategory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleFilter();
    }, 300);
    return () => clearTimeout(debounce);
  }, [handleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE);
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRefresh = () => {
    loadOpportunities(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Opportunités{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Disponibles
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvre les bourses, formations et stages qui correspondent à ton profil
            </p>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredOpportunities.length} opportunité{filteredOpportunities.length > 1 ? "s" : ""} trouvée{filteredOpportunities.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Offline Banner */}
          {usingFallback && (
            <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning-foreground">
                Mode hors ligne - Affichage des données en cache
              </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une opportunité..."
                className="pl-10 rounded-xl border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] rounded-xl border-border">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="bourse">Bourses</SelectItem>
                <SelectItem value="formation">Formations</SelectItem>
                <SelectItem value="stage">Stages</SelectItem>
                <SelectItem value="echange">Échanges</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && opportunities.length === 0 && (
            <div className="max-w-md mx-auto text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredOpportunities.length === 0 && opportunities.length > 0 && (
            <div className="max-w-md mx-auto text-center py-12">
              <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune opportunité trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Opportunities Grid */}
          {!loading && paginatedOpportunities.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedOpportunities.map((opportunity, index) => (
                  <div
                    key={opportunity.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <OpportunityCard
                      title={opportunity.titre}
                      description={opportunity.description}
                      category={opportunity.type}
                      location={opportunity.pays || "Non spécifié"}
                      deadline={opportunity.date_limite || "Non spécifié"}
                      link={opportunity.lien}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
