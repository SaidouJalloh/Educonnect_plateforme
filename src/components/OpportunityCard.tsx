import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar } from "lucide-react";

interface OpportunityCardProps {
  title: string;
  description: string;
  category: string;
  location: string;
  deadline: string;
  link?: string;
}

const OpportunityCard = ({
  title,
  description,
  category,
  location,
  deadline,
  link,
}: OpportunityCardProps) => {
  return (
    <Card className="group hover:shadow-medium transition-smooth border-border overflow-hidden">
      <div className="h-2 bg-gradient-primary" />
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-smooth">
            {title}
          </CardTitle>
          <Badge variant="secondary" className="flex-shrink-0">
            {category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>Date limite: {deadline}</span>
          </div>
        </div>
        {link && (
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:border-primary group-hover:text-primary transition-smooth"
            asChild
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
              En savoir plus
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
