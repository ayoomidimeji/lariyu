import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="aspect-square bg-muted/20 relative overflow-hidden">
        <Skeleton className="w-full h-full absolute inset-0 rounded-none bg-muted-foreground/5 dark:bg-muted-foreground/10" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2 rounded-sm" />
        <Skeleton className="h-6 w-1/3 rounded-sm" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
};
