import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ReservasReviewView() {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <CardTitle>Reseñas de Reservas</CardTitle>
        <CardDescription>Aquí puedes ver las reseñas de las reservas.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Contenido de las reseñas de reservas aquí.</p>
      </CardContent>
    </Card>
  );
}
