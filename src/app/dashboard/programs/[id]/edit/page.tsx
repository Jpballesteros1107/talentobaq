import ProgramFormPage from '@/components/programs/program-form';

export default function EditProgramPage({ params }: { params: { id: string } }) {
  return <ProgramFormPage programId={params.id} />;
}
